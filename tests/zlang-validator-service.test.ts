import { describe, expect, it } from "vitest";

import { validateZlangService } from "../lib/zlang-validator-service";

describe("Zlang validator service", () => {
  it("accepts allowlisted micro terminal source without executing it", () => {
    const result = validateZlangService("zdos.zlang.microterm.v1", "help\nemit ZDOS ready");

    expect(result.accepted).toBe(true);
    expect(result.policy).toBe("DEFAULT-DENY");
    expect(result.execution).toBe("DENIED");
    expect(result.denied).toEqual([]);
  });

  it("rejects unknown profiles and arbitrary execution", () => {
    const result = validateZlangService("zdos.unknown.v1", "exec shell\nsocket.open");

    expect(result.accepted).toBe(false);
    expect(result.detail).toContain("not allowlisted");
    expect(result.execution).toBe("DENIED");
  });

  it("validates the ZComm profile through the same service contract", () => {
    const result = validateZlangService("zdos.videotex.native.v1", "status node.profile\nemit hello");

    expect(result.accepted).toBe(true);
    expect(result.operations).toHaveLength(2);
  });
});
