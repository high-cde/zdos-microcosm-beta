import { describe, expect, it } from "vitest";
import { ZDOS_NODE_CONTRACT } from "../server/zdos-node";

describe("ZDOS native node contract", () => {
  it("declares the Zlang by ZDOS read-only capabilities", () => {
    expect(ZDOS_NODE_CONTRACT).toContain("module zdos.microcosm.node");
    expect(ZDOS_NODE_CONTRACT).toContain("policy DEFAULT-DENY");
    expect(ZDOS_NODE_CONTRACT).toContain("capability status.read");
    expect(ZDOS_NODE_CONTRACT).toContain("capability manifest.read");
    expect(ZDOS_NODE_CONTRACT).toContain("capability shell.deny");
    expect(ZDOS_NODE_CONTRACT).toContain("capability crypto.deny");
  });

  it("ends the node program explicitly", () => {
    expect(ZDOS_NODE_CONTRACT).toContain("status.read()\n  halt()");
  });
});
