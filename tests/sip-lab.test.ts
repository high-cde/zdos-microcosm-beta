import { describe, expect, it } from "vitest";

import { runSipLabScenario } from "../lib/sip-lab";

describe("local SIP Lab scenarios", () => {
  it("generates a REGISTER request and simulated 200 response", () => {
    const result = runSipLabScenario("REGISTER", "alice", "example.invalid");
    expect(result?.request).toContain("REGISTER sip:alice@example.invalid SIP/2.0");
    expect(result?.request).toContain("Expires: 3600");
    expect(result?.responses[0]).toContain("SIP/2.0 200 OK");
  });

  it("shows the INVITE call progression without creating a media session", () => {
    const result = runSipLabScenario("INVITE", "alice", "example.invalid");
    expect(result?.request).toContain("Content-Type: application/sdp");
    expect(result?.responses.map((response) => response.match(/SIP\/2\.0 \d{3}/)?.[0])).toEqual([
      "SIP/2.0 100",
      "SIP/2.0 180",
      "SIP/2.0 200",
    ]);
    expect(result?.responses[2]).toContain("no media session created");
  });

  it.each(["bad user", "alice\r\nVia: injected", "", "a@b"]) ("rejects unsafe SIP identities: %s", (user) => {
    expect(runSipLabScenario("OPTIONS", user, "example.invalid")).toBeNull();
  });

  it("rejects invalid domains", () => {
    expect(runSipLabScenario("BYE", "alice", "example.invalid;transport=tcp")).toBeNull();
  });
});
