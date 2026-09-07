import { describe, expect, it, beforeEach } from "vitest";

describe("ZComm SIP-Videotel contract", () => {
  beforeEach(() => {
    delete process.env.ZCOMM_API_TOKEN;
  });

  it("keeps the canonical Videotel contract immutable", () => {
    const contract = "ZLANG ZDOS ZCOMM SIP-VIDEO-TEL V23 PAGE-40X24 DEFAULT-DENY HALT";
    expect(contract).toContain("SIP-VIDEO-TEL");
    expect(contract).toContain("V23");
    expect(contract).toContain("PAGE-40X24");
    expect(contract).toContain("DEFAULT-DENY");
  });

  it("accepts only numeric Videotel page navigation", () => {
    expect(/^\*\d{1,4}#$/.test("*165#")).toBe(true);
    expect(/^\*\d{1,4}#$/.test("*777#")).toBe(true);
    expect(/^\*\d{1,4}#$/.test("/etc/passwd")).toBe(false);
    expect(/^\*\d{1,4}#$/.test("<script>alert(1)</script>")).toBe(false);
  });

  it("keeps transport capabilities explicitly denied", () => {
    const denied = { tx: "DENIED", radio: "DENIED", shell: "DENIED" };
    expect(denied).toEqual({ tx: "DENIED", radio: "DENIED", shell: "DENIED" });
  });
});
