import { describe, expect, it, vi } from "vitest";
import { classifyNodeStatus, fetchNodeStatus, type NodeStatusPayload } from "../lib/node-status";

const payload: NodeStatusPayload = {
  schema: "zdos.node.status.v1",
  node_id: "core-01",
  role: "observability",
  status: "ONLINE",
  policy: "default-deny",
  capabilities: ["heartbeat", "public-status", "integrity-attestation"],
  heartbeat_at: "2026-09-06T00:00:00.000Z",
  uptime_seconds: 42,
  zlang_source_sha256: "source",
  zlb2_bytecode_sha256: "bytecode",
  capability_registry_sha256: "registry",
  execution: "heartbeat-only",
  network: "no-listener",
};

describe("node status", () => {
  it("classifies a fresh online heartbeat", () => {
    expect(classifyNodeStatus(payload, Date.parse("2026-09-06T00:00:30.000Z"))).toBe("ONLINE");
  });

  it("classifies an old heartbeat as stale", () => {
    expect(classifyNodeStatus(payload, Date.parse("2026-09-06T00:02:00.000Z"))).toBe("STALE");
  });

  it("rejects an invalid payload", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ node_id: "wrong" }), { status: 200 }));
    await expect(fetchNodeStatus("https://node.invalid/status", fetchImpl)).rejects.toThrow("invalid node status payload");
  });

  it("rejects HTTP failures", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("offline", { status: 503 }));
    await expect(fetchNodeStatus("https://node.invalid/status", fetchImpl)).rejects.toThrow("node status HTTP 503");
  });
});
