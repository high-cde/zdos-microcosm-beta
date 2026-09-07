import { describe, expect, it } from "vitest";
import { normalizeSipUri, runZcommZlang, zcommZlangTemplate } from "../lib/zcomm";

describe("zcomm", () => {
  it("normalizes valid SIP URIs", () => {
    expect(normalizeSipUri("alice@example.org")).toBe("sip:alice@example.org");
    expect(normalizeSipUri("sip:bob@pbx.example.org")).toBe("sip:bob@pbx.example.org");
    expect(normalizeSipUri("not-an-address")).toBeNull();
  });

  it("accepts the shipped Zlang by zdos profile", () => {
    const result = runZcommZlang(zcommZlangTemplate(), "alice@example.org");
    expect(result.status).toBe("ACCEPTED");
    expect(result.output).toContain("ZCOMM / SIP VIDEO TELEPHONE");
    expect(result.capabilities).toContain("zcomm.video");
  });

  it("denies invalid targets without attempting a call", () => {
    const result = runZcommZlang(zcommZlangTemplate(), "invalid");
    expect(result.status).toBe("DENIED");
    expect(result.output).toContain("No call or network operation attempted");
  });

  it("requires HALT and rejects unknown instructions", () => {
    expect(runZcommZlang("zcomm.status", "alice@example.org").status).toBe("DENIED");
    expect(runZcommZlang("zcomm.status\nzcomm.socket open\nhalt", "alice@example.org").status).toBe("DENIED");
  });
});
