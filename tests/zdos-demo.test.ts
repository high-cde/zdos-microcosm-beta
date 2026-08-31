import { describe, expect, it } from "vitest";

import { computeZtrace, createReceipt, previewZretro, runTerminalCommand, validateZlang } from "../lib/zdos-demo";
import { PRIVATE_ZDOS_NODE, nodeBindingState } from "../lib/zdos-node";

describe("ZDOS local demo contracts", () => {
  it("returns the bounded system status without executing a shell", () => {
    const result = runTerminalCommand("status");

    expect(result.status).toBe("READY");
    expect(result.output).toContain("network: denied");
    expect(result.output).toContain("storage: ./workspace only");
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

  it("recognizes the enrolled VPS metadata without enabling remote execution", () => {
    expect(nodeBindingState(PRIVATE_ZDOS_NODE)).toBe("IDENTIFIED");
    expect(PRIVATE_ZDOS_NODE.nodeName).toBe("vmi3082470.contaboserver.net");
    expect(PRIVATE_ZDOS_NODE.transport).toBe("not-configured");
    expect(PRIVATE_ZDOS_NODE.remoteExecution).toBe(false);
    expect(PRIVATE_ZDOS_NODE.networkExposure).toBe(false);
  });
});
