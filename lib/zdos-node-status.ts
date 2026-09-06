export const DEFAULT_ZDOS_NODE_STATUS_URL = "https://x-zdos.it/api/node/core-01/status";
export const ZDOS_NODE_STATUS_SCHEMA = "zdos.node.status.v1";
export const ZDOS_NODE_ID = "core-01";
export const ZDOS_HEARTBEAT_MAX_AGE_SECONDS = 90;
export const ZDOS_STATUS_TIMEOUT_MS = 8_000;

export type ZdosNodeStatus = "ONLINE" | "STALE" | "OFFLINE";

export type ZdosNodeStatusPayload = {
  schema: typeof ZDOS_NODE_STATUS_SCHEMA;
  node_id: typeof ZDOS_NODE_ID;
  status: "ONLINE" | string;
  policy: string;
  capabilities: string[];
  heartbeat_at: string;
  uptime_seconds: number;
  execution: string;
  network: string;
};

export type ZdosNodeStatusResult = {
  status: ZdosNodeStatus;
  payload: ZdosNodeStatusPayload | null;
  detail: string;
  checked_at: string;
};

function statusUrl() {
  return process.env.EXPO_PUBLIC_ZDOS_NODE_STATUS_URL || DEFAULT_ZDOS_NODE_STATUS_URL;
}

function isValidPayload(value: unknown): value is ZdosNodeStatusPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<ZdosNodeStatusPayload>;
  return (
    payload.schema === ZDOS_NODE_STATUS_SCHEMA &&
    payload.node_id === ZDOS_NODE_ID &&
    typeof payload.status === "string" &&
    typeof payload.policy === "string" &&
    Array.isArray(payload.capabilities) &&
    payload.capabilities.every((item) => typeof item === "string") &&
    typeof payload.heartbeat_at === "string" &&
    Number.isFinite(payload.uptime_seconds) &&
    typeof payload.execution === "string" &&
    typeof payload.network === "string"
  );
}

function isFreshHeartbeat(heartbeatAt: string, now: number) {
  const heartbeatTime = Date.parse(heartbeatAt);
  if (!Number.isFinite(heartbeatTime)) return false;
  const ageSeconds = (now - heartbeatTime) / 1000;
  return ageSeconds >= 0 && ageSeconds <= ZDOS_HEARTBEAT_MAX_AGE_SECONDS;
}

export async function fetchZdosNodeStatus(
  fetcher: typeof fetch = fetch,
  now = Date.now(),
): Promise<ZdosNodeStatusResult> {
  const checkedAt = new Date(now).toISOString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ZDOS_STATUS_TIMEOUT_MS);

  try {
    const response = await fetcher(statusUrl(), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      return { status: "OFFLINE", payload: null, detail: `HTTP ${response.status}`, checked_at: checkedAt };
    }

    const body: unknown = await response.json();
    if (!isValidPayload(body)) {
      return { status: "OFFLINE", payload: null, detail: "invalid node status payload", checked_at: checkedAt };
    }

    if (body.status !== "ONLINE") {
      return { status: "OFFLINE", payload: body, detail: "node reported a non-ONLINE status", checked_at: checkedAt };
    }

    if (!isFreshHeartbeat(body.heartbeat_at, now)) {
      return { status: "STALE", payload: body, detail: "heartbeat older than 90 seconds", checked_at: checkedAt };
    }

    return { status: "ONLINE", payload: body, detail: "recent HTTPS heartbeat received", checked_at: checkedAt };
  } catch (error) {
    const detail = error instanceof Error && error.name === "AbortError" ? "request timeout" : "HTTPS request failed";
    return { status: "OFFLINE", payload: null, detail, checked_at: checkedAt };
  } finally {
    clearTimeout(timeout);
  }
}

export function nodeStatusAsReceiptStatus(status: ZdosNodeStatus): "READY" | "ROADMAP" | "DENIED" {
  if (status === "ONLINE") return "READY";
  if (status === "STALE") return "ROADMAP";
  return "DENIED";
}
