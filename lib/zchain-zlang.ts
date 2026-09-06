export const ZCHAIN_ZLANG_PROFILE = "zchain.zlang.readonly.v1";
export const DEFAULT_ZCHAIN_RPC_URL = "https://zchain.example.invalid/rpc";
export const DEFAULT_ORBOT_SOCKS_HOST = "127.0.0.1";
export const DEFAULT_ORBOT_SOCKS_PORT = 9050;

export type ZchainCapability = "chain.info" | "block.read" | "receipt.verify";
export type ZchainOperation = "CHAIN_INFO" | "BLOCK_READ" | "RECEIPT_VERIFY";

export type ZchainProjectConfig = {
  profile: typeof ZCHAIN_ZLANG_PROFILE;
  rpcUrl: string;
  orbot: {
    enabled: boolean;
    socksHost: string;
    socksPort: number;
  };
  capabilities: readonly ZchainCapability[];
  signing: false;
  broadcast: false;
};

export const ZCHAIN_PROJECT: ZchainProjectConfig = {
  profile: ZCHAIN_ZLANG_PROFILE,
  rpcUrl: process.env.EXPO_PUBLIC_ZCHAIN_RPC_URL || DEFAULT_ZCHAIN_RPC_URL,
  orbot: {
    enabled: process.env.EXPO_PUBLIC_ORBOT_ENABLED === "true",
    socksHost: process.env.EXPO_PUBLIC_ORBOT_SOCKS_HOST || DEFAULT_ORBOT_SOCKS_HOST,
    socksPort: Number(process.env.EXPO_PUBLIC_ORBOT_SOCKS_PORT || DEFAULT_ORBOT_SOCKS_PORT),
  },
  capabilities: ["chain.info", "block.read", "receipt.verify"],
  signing: false,
  broadcast: false,
};

export type ZchainZlangResult = {
  accepted: boolean;
  operation: ZchainOperation | null;
  output: string;
  detail: string;
};

export function validateZchainZlang(source: string): ZchainZlangResult {
  const instruction = source.trim().toUpperCase();
  const operations: Record<string, ZchainOperation> = {
    "READ CHAIN": "CHAIN_INFO",
    "READ BLOCK": "BLOCK_READ",
    "VERIFY RECEIPT": "RECEIPT_VERIFY",
  };
  const operation = operations[instruction] || null;

  if (!operation) {
    return {
      accepted: false,
      operation: null,
      output: "DENIED: unsupported Zchain instruction",
      detail: "read-only profile accepts READ CHAIN, READ BLOCK or VERIFY RECEIPT",
    };
  }

  return {
    accepted: true,
    operation,
    output: `${operation} · READ-ONLY · HALT`,
    detail: "instruction accepted; no signing or broadcast capability",
  };
}

export function orbotEndpoint(config: ZchainProjectConfig = ZCHAIN_PROJECT) {
  return `socks5://${config.orbot.socksHost}:${config.orbot.socksPort}`;
}
