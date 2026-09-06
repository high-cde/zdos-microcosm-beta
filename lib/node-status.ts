export type RemoteNodeState = "ONLINE" | "STALE" | "OFFLINE" | "INVALID";

export type NodeStatusPayload = {
  schema: "zdos.node.status.v1";
  node_id: string;
  role: string;
  status: string;
  policy: string;
  capabilities: string[];
  heartbeat_at: string;
  uptime_seconds: number;
  zlang_source_sha256: string | null;
  zlb2_bytecode_sha256: string | null;
  capability_registry_sha256: string | null;
  attestation?: {
    schema?: string;
    mode?: string;
    subject?: string;
    status?: string;
  };
  activation?: {
    status?: string;
    activation_id?: string | null;
    capabilities?: string[];
  };
  execution: string;
  network: string;
};

export const NODE_STATUS_URL =
  process.env.EXPO_PUBLIC_ZDOS_NODE_STATUS_URL ?? "https://x-zdos.it/api/node/core-01/status";

const REQUEST_TIMEOUT_MS = 8000;
const FRESHNESS_WINDOW_MS = 90_000;

function isStatusPayload(value: unknown): value is NodeStatusPayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<NodeStatusPayload>;
  return (
    candidate.schema === "zdos.node.status.v1" &&
    candidate.node_id === "core-01" &&
    typeof candidate.status === "string" &&
    typeof candidate.policy === "string" &&
    Array.isArray(candidate.capabilities) &&
    typeof candidate.heartbeat_at === "string" &&
    typeof candidate.uptime_seconds === "number" &&
    typeof candidate.execution === "string" &&
    typeof candidate.network === "string"
  );
}

export function classifyNodeStatus(payload: NodeStatusPayload, now = Date.now()): RemoteNodeState {
  if (payload.status !== "ONLINE") return "STALE";
  const heartbeat = Date.parse(payload.heartbeat_at);
  if (!Number.isFinite(heartbeat)) return "INVALID";
  return now - heartbeat <= FRESHNESS_WINDOW_MS ? "ONLINE" : "STALE";
}

export async function fetchNodeStatus(
  url = NODE_STATUS_URL,
  fetchImpl: typeof fetch = fetch,
): Promise<NodeStatusPayload> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`node status HTTP ${response.status}`);
    const payload: unknown = await response.json();
    if (!isStatusPayload(payload)) throw new Error("invalid node status payload");
    return payload;
  } finally {
    clearTimeout(timer);
  }
}
