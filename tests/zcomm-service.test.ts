import { describe, expect, it } from "vitest";

import { getZcommCatalog, getZcommServicePage } from "../lib/zcomm-service";

describe("ZComm read-only service", () => {
  it("serves a bounded catalog for the public node", () => {
    const catalog = getZcommCatalog();

    expect(catalog.schema).toBe("zdos.zcomm.catalog.v1");
    expect(catalog.node_id).toBe("core-01");
    expect(catalog.capabilities).toEqual(["zcomm.catalog.read", "zcomm.page.read"]);
    expect(catalog.pages).toHaveLength(3);
    expect(catalog.pages.every((page) => page.rows.every((row) => row.length <= 40))).toBe(true);
    expect(catalog.execution).toBe("DENIED");
  });

  it("returns only allowlisted pages and rejects unknown codes", () => {
    expect(getZcommServicePage("*02#")).toMatchObject({ found: true, title: "ZLANG RUNTIME" });
    expect(getZcommServicePage("*99#")).toMatchObject({ found: false, rows: [] });
  });
});
