import { describe, expect, it, vi } from "vitest";

import { fetchZdosNodeStatus } from "../lib/zdos-node-status";

const payload = (heartbeat_at: string, status = "ONLINE") => ({
  schema: "zdos.node.status.v1",
  node_id: "core-01",
  status,
  policy: "default-deny",
  capabilities: ["heartbeat", "public-status", "integrity-attestation"],
  heartbeat_at,
  uptime_seconds: 123,
  execution: "heartbeat-only",
  network: "no-listener",
});

describe("ZDOS public node status contract", () => {
  it("accepts a recent ONLINE heartbeat", async () => {
    const now = Date.parse("2026-09-06T00:01:00.000Z");
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => payload("2026-09-06T00:00:30.000Z") });

    const result = await fetchZdosNodeStatus(fetcher, now);

    expect(result.status).toBe("ONLINE");
    expect(fetcher).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: "GET" }));
  });

  it("marks a heartbeat older than 90 seconds as STALE", async () => {
    const now = Date.parse("2026-09-06T00:01:31.000Z");
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => payload("2026-09-06T00:00:00.000Z") });

    const result = await fetchZdosNodeStatus(fetcher, now);

    expect(result.status).toBe("STALE");
  });

  it("marks HTTP failures and invalid payloads as OFFLINE", async () => {
    const httpFailure = await fetchZdosNodeStatus(vi.fn().mockResolvedValue({ ok: false, status: 503 }), 0);
    const invalidPayload = await fetchZdosNodeStatus(vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }), 0);

    expect(httpFailure.status).toBe("OFFLINE");
    expect(invalidPayload.status).toBe("OFFLINE");
  });
});
