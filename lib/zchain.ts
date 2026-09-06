import * as Crypto from "expo-crypto";

export type ZChainEvent = {
  type: "ledger.genesis" | "node.status" | "evidence.append";
  subject: string;
  result: "accepted" | "denied" | "verified";
  policy: "DEFAULT-DENY";
};

export type ZChainEntry = {
  schema: "zchain-local/v1";
  sequence: number;
  previousHash: string;
  event: ZChainEvent;
  hash: string;
};

const GENESIS_HASH = "0".repeat(64);

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

async function digest(value: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);
}

export async function createEntry(
  previousHash: string,
  sequence: number,
  event: ZChainEvent,
): Promise<ZChainEntry> {
  const unsigned = {
    schema: "zchain-local/v1" as const,
    sequence,
    previousHash,
    event,
  };
  const hash = await digest(`${previousHash}\n${canonical(unsigned)}`);
  return { ...unsigned, hash };
}

export async function createLocalChain(): Promise<ZChainEntry[]> {
  const genesis = await createEntry(GENESIS_HASH, 0, {
    type: "ledger.genesis",
    subject: "ZDOS Microcosm local node",
    result: "verified",
    policy: "DEFAULT-DENY",
  });
  const status = await createEntry(genesis.hash, 1, {
    type: "node.status",
    subject: "ZNODE-LOCAL-MICROCOSM",
    result: "accepted",
    policy: "DEFAULT-DENY",
  });
  return [genesis, status];
}

export async function appendEvidence(
  chain: ZChainEntry[],
  subject: string,
  result: ZChainEvent["result"] = "verified",
): Promise<ZChainEntry[]> {
  const previous = chain[chain.length - 1];
  if (!previous) return createLocalChain();
  const entry = await createEntry(previous.hash, chain.length, {
    type: "evidence.append",
    subject,
    result,
    policy: "DEFAULT-DENY",
  });
  return [...chain, entry];
}

export async function verifyChain(chain: ZChainEntry[]): Promise<boolean> {
  if (!chain.length) return false;
  let previousHash = GENESIS_HASH;
  for (const [sequence, entry] of chain.entries()) {
    if (entry.schema !== "zchain-local/v1" || entry.sequence !== sequence || entry.previousHash !== previousHash) {
      return false;
    }
    const expected = await digest(`${entry.previousHash}\n${canonical({
      schema: entry.schema,
      sequence: entry.sequence,
      previousHash: entry.previousHash,
      event: entry.event,
    })}`);
    if (expected !== entry.hash) return false;
    previousHash = entry.hash;
  }
  return true;
}
