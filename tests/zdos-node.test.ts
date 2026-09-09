import { describe, expect, it } from "vitest";

import { evaluateZlang, executeZlang, initialState } from "../node/zdos-node";

describe("ZDOS Node headless contracts", () => {
  it("boots with local-only default-deny posture", () => {
    const state = initialState();
    expect(state.posture).toBe("DEFAULT-DENY");
    expect(state.mode).toBe("OBSERVE");
    expect(state.tx).toBe("DENIED");
    expect(state.network).toBe("LOCAL-ONLY");
  });

  it("accepts the bounded node.local Zlang profile", () => {
    const result = evaluateZlang("node.status\ngps.status\nradio.status\nzcomm.queue\nhalt");
    expect(result.status).toBe("ACCEPTED");
    expect(result.output).toContain("radio: RX-ONLY");
    expect(result.capabilities).toContain("zcomm.queue");
  });

  it("rejects arbitrary syntax and radio transmission", () => {
    expect(evaluateZlang("exec rm -rf /\nhalt").status).toBe("DENIED");
    expect(evaluateZlang("node.status\nradio.transmit\nhalt").status).toBe("DENIED");
  });

  it("executes the safe local Zlang steps and returns live node state", () => {
    const result = executeZlang("node.status\ngps.status\nzcomm.queue\nevidence.commit\nhalt", initialState());
    expect(result.status).toBe("EXECUTED");
    expect(result.output).toContain("node.posture: DEFAULT-DENY");
    expect(result.output).toContain("zcomm: LOCAL-QUEUE");
    expect(result.steps).toEqual(["node.status", "gps.status", "zcomm.queue"]);
  });

  it("does not execute a program containing a radio transmit instruction", () => {
    const result = executeZlang("node.status\nradio.tx\nhalt", initialState());
    expect(result.status).toBe("DENIED");
    expect(result.steps).toHaveLength(0);
  });
});
