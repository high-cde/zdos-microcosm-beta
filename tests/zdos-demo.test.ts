import { describe, expect, it } from "vitest";

import { computeZtrace, createReceipt, previewZretro, runTerminalCommand, validateZlang } from "../lib/zdos-demo";
import { PRIVATE_ZDOS_NODE, nodeBindingState } from "../lib/zdos-node";
import { runTelecomZlang, telecomZlangTemplate } from "../lib/zdos-telecom";
import { emptyZCommState, queueZCommMessage, runZcommZlang } from "../lib/zdos-zcomm";
import { appendRuntimeReceipt, createRuntimeState, runtimeStatus, verifyRuntimeState } from "../lib/zdos-runtime";
import { describeCapabilityAction, getLocalOperationalSnapshot } from "../lib/zdos-ops";

describe("ZDOS local demo contracts", () => {
  it("returns the bounded system status without executing a shell", () => {
    const result = runTerminalCommand("status");

    expect(result.status).toBe("READY");
    expect(result.output).toContain("network: denied");
    expect(result.output).toContain("storage: ./workspace only");
  });

  it("exposes the telecom tool from the bounded terminal catalog", () => {
    const help = runTerminalCommand("help");
    const telecom = runTerminalCommand("telecom");

    expect(help.output).toContain("telecom");
    expect(telecom.status).toBe("READY");
    expect(telecom.output).toContain("transmit: DENIED");
  });

  it("accepts the supported Zlang emit profile", () => {
    const result = validateZlang("emit ZDOS risponde");

    expect(result.status).toBe("ACCEPTED");
    expect(result.detail).toBe("ZLB2 v2.5 · emit · HALT");
  });

  it("denies syntax outside the supported Zlang profile", () => {
    const result = validateZlang("exec rm -rf /");

    expect(result.status).toBe("DENIED");
    expect(result.detail).toBe("syntax outside supported profile");
  });

  it("verifies the local ZRetro preview contract", () => {
    const result = previewZretro("project Meteor Patrol");

    expect(result.status).toBe("VERIFIED");
    expect(result.detail).toBe("IR READY · manifest prepared");
  });

  it("denies unknown terminal commands and preserves receipt fields", () => {
    const result = runTerminalCommand("open-socket");
    const receipt = createReceipt("terminal.open-socket", result, "receipt-001");

    expect(result.status).toBe("DENIED");
    expect(receipt).toEqual({
      id: "receipt-001",
      operation: "terminal.open-socket",
      status: "DENIED",
      detail: "command outside supported profile",
    });
  });

  it("creates a stable, non-secret ZTRACE fingerprint for the same session context", () => {
    const first = computeZtrace("profile", 3);
    const second = computeZtrace("profile", 3);

    expect(first).toBe(second);
    expect(first).toMatch(/^ZTRACE-[0-9A-F]{8}$/);
    expect(computeZtrace("profile", 4)).not.toBe(first);
  });

  it("accepts the bounded telecom Zlang profile without performing network operations", () => {
    const result = runTelecomZlang(telecomZlangTemplate());

    expect(result.status).toBe("ACCEPTED");
    expect(result.output).toContain("link: LOCAL OBSERVATION");
    expect(result.output).toContain("transmit: DENIED");
    expect(result.detail).toBe("ZLB2 telecom.local · observe · HALT");
  });

  it("denies telecom syntax outside the supported profile", () => {
    const result = runTelecomZlang("telecom.open socket=radio0\ntelecom.tx send");

    expect(result.status).toBe("DENIED");
    expect(result.output).toContain("No radio, socket or network operation attempted.");
  });

  it("requires an explicit HALT in the telecom profile", () => {
    const result = runTelecomZlang("telecom.status");

    expect(result.status).toBe("DENIED");
    expect(result.detail).toBe("telecom profile requires status and HALT");
  });

  it("recognizes only the local application profile without remote execution", () => {
    expect(nodeBindingState(PRIVATE_ZDOS_NODE)).toBe("IDENTIFIED");
    expect(PRIVATE_ZDOS_NODE.nodeName).toBe("local-app");
    expect(PRIVATE_ZDOS_NODE.nodeId).toBe("LOCAL-APP");
    expect(PRIVATE_ZDOS_NODE.transport).toBe("not-configured");
    expect(PRIVATE_ZDOS_NODE.remoteExecution).toBe(false);
    expect(PRIVATE_ZDOS_NODE.networkExposure).toBe(false);
  });

  it("accepts the ZComm Videotel profile with an explicit HALT", () => {
    const result = runZcommZlang("zcomm.status\nzcomm.page.list\nzcomm.room.list\nzcomm.sync status\nzcomm.tx deny\nhalt");
    expect(result.status).toBe("ACCEPTED");
    expect(result.output).toContain("screen: CEPT 40x24");
    expect(result.output).toContain("transmit: DENIED");
  });

  it("denies shell and arbitrary socket syntax in ZComm", () => {
    const result = runZcommZlang("zcomm.open socket=chat\nexec rm -rf /");
    expect(result.status).toBe("DENIED");
    expect(result.output).toContain("No shell, socket or credential operation attempted.");
  });

  it("queues a bounded message offline without losing the local state", async () => {
    const next = await queueZCommMessage(emptyZCommState(), "piazza", "ALICE", "ciao microcosmo");
    expect(next.pending).toHaveLength(1);
    expect(next.pending[0].body).toBe("ciao microcosmo");
    expect(next.pending[0].pending).toBe(true);
  });

  it("boots a real local runtime with an explicit default-deny posture", () => {
    const runtime = createRuntimeState("2026-09-08T00:00:00.000Z");
    expect(runtime.nodeId).toBe("LOCAL-APP");
    expect(runtime.transport).toBe("local-only");
    expect(runtime.remoteExecution).toBe(false);
    expect(runtime.networkExposure).toBe(false);
    expect(verifyRuntimeState(runtime)).toBe(true);
    expect(runtimeStatus(runtime).healthy).toBe(true);
  });

  it("extends the evidence chain and detects tampering", () => {
    const runtime = appendRuntimeReceipt(createRuntimeState("2026-09-08T00:00:00.000Z"), { operation: "terminal.status", status: "READY", detail: "posture inspected" }, 123);
    expect(runtime.receipts).toHaveLength(2);
    expect(runtime.chainHead).toContain("terminal.status-123");
    expect(verifyRuntimeState(runtime)).toBe(true);
    expect(verifyRuntimeState({ ...runtime, posture: "BROKEN" as never })).toBe(false);
  });

  it("exposes a deterministic local operations snapshot with safe degraded states", () => {
    const snapshot = getLocalOperationalSnapshot();
    expect(snapshot.posture).toBe("LOCAL / DEFAULT-DENY");
    expect(snapshot.network).toBe("DENIED");
    expect(snapshot.gps).toBe("LOCAL-ONLY");
    expect(snapshot.radio).toBe("OBSERVE-ONLY");
    expect(snapshot.resources.find((resource) => resource.key === "WTR")?.state).toBe("UNKNOWN");
  });

  it("keeps radio transmission denied while allowing message preparation", () => {
    expect(describeCapabilityAction("radio.tx").status).toBe("DENIED");
    expect(describeCapabilityAction("message.queue").status).toBe("READY");
  });
});
