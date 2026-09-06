import { describe, expect, it } from "vitest";

import { ZCHAIN_PROJECT, orbotEndpoint, validateZchainZlang } from "../lib/zchain-zlang";

describe("Zchain Zlang read-only profile", () => {
  it("accepts only bounded read operations", () => {
    expect(validateZchainZlang("READ CHAIN").operation).toBe("CHAIN_INFO");
    expect(validateZchainZlang("READ BLOCK").operation).toBe("BLOCK_READ");
    expect(validateZchainZlang("VERIFY RECEIPT").operation).toBe("RECEIPT_VERIFY");
    expect(validateZchainZlang("SEND 1 ZCHAIN").accepted).toBe(false);
  });

  it("keeps signing and broadcast disabled", () => {
    expect(ZCHAIN_PROJECT.signing).toBe(false);
    expect(ZCHAIN_PROJECT.broadcast).toBe(false);
    expect(orbotEndpoint(ZCHAIN_PROJECT)).toContain("socks5://");
  });
});
