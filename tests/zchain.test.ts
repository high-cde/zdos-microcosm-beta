import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("expo-crypto", () => ({
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
  digestStringAsync: async (_algorithm: string, value: string) => createHash("sha256").update(value).digest("hex"),
}));

import { appendEvidence, createLocalChain, verifyChain } from "../lib/zchain";

describe("ZChain local evidence", () => {
  it("creates a verified offline genesis chain", async () => {
    const chain = await createLocalChain();

    expect(chain).toHaveLength(2);
    expect(chain[0].event.type).toBe("ledger.genesis");
    expect(chain[1].event.type).toBe("node.status");
    expect(await verifyChain(chain)).toBe(true);
  });

  it("appends a project evidence record with a previous hash", async () => {
    const chain = await createLocalChain();
    const next = await appendEvidence(chain, "project.zdos.opened");

    expect(next).toHaveLength(3);
    expect(next[2].event.type).toBe("evidence.append");
    expect(next[2].previousHash).toBe(next[1].hash);
    expect(await verifyChain(next)).toBe(true);
  });

  it("rejects a tampered entry", async () => {
    const chain = await createLocalChain();
    const tampered = chain.map((entry) => ({ ...entry }));
    tampered[1] = { ...tampered[1], event: { ...tampered[1].event, subject: "tampered" } };

    expect(await verifyChain(tampered)).toBe(false);
  });
});
