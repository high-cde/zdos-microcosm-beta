import { describe, expect, it } from "vitest";

import {
  isFixedGridLine,
  servicePageForCode,
  validateVideotexProgram,
  validateZcommLine,
  VIDEOTEX_ZLANG_SOURCE,
  ZCOMM_COLUMNS,
} from "../lib/zcomm-videotex";

describe("ZComm Z-Videotex contract", () => {
  it("accepts the native Videotex program without arbitrary commands", () => {
    const results = validateVideotexProgram(VIDEOTEX_ZLANG_SOURCE);

    expect(results).toHaveLength(10);
    expect(results.every((result) => result.status !== "DENIED")).toBe(true);
    expect(validateZcommLine("exec shell").status).toBe("DENIED");
    expect(validateZcommLine("socket.open").status).toBe("DENIED");
  });

  it("keeps the CEPT-inspired rendering grid bounded", () => {
    expect(isFixedGridLine("x".repeat(ZCOMM_COLUMNS))).toBe(true);
    expect(isFixedGridLine("x".repeat(ZCOMM_COLUMNS + 1))).toBe(false);
    expect(servicePageForCode("*01#")).toContain("core-01");
    expect(servicePageForCode("*03#")).toContain("EVIDENCE CHAIN");
  });
});
