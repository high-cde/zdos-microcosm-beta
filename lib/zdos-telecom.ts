import type { DemoResult } from "./zdos-demo";

export type TelecomZlangResult = DemoResult & {
  normalized: string;
  capabilities: readonly string[];
};

const SUPPORTED_LINES = [
  "telecom.status",
  "telecom.scan band=uhf",
  "telecom.route inspect",
  "telecom.tx deny",
  "halt",
] as const;

const CAPABILITIES = ["telecom.status", "telecom.scan", "telecom.route.inspect"] as const;

function denied(source: string, detail = "telecom capability denied by default-deny profile"): TelecomZlangResult {
  return {
    output: `DENIED: ${source || "empty program"}\nNo radio, socket or network operation attempted.`,
    status: "DENIED",
    detail,
    normalized: source,
    capabilities: [],
  };
}

/**
 * Executes the bounded Zlang telecom profile locally.
 * This is an interpreter for a teaching contract, not a modem, scanner or network client.
 */
export function runTelecomZlang(source: string): TelecomZlangResult {
  const normalized = source
    .split("\n")
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean)
    .join("\n");
  const lines = normalized.split("\n").filter(Boolean);

  if (!lines.length || lines.some((line) => !SUPPORTED_LINES.includes(line as (typeof SUPPORTED_LINES)[number]))) {
    return denied(normalized || "empty program", "syntax outside supported telecom Zlang profile");
  }

  const hasStatus = lines.includes("telecom.status");
  const hasHalt = lines.includes("halt");
  if (!hasStatus || !hasHalt) {
    return denied(normalized, "telecom profile requires status and HALT");
  }

  const txDenied = lines.includes("telecom.tx deny");
  const scanRequested = lines.includes("telecom.scan band=uhf");
  const routeRequested = lines.includes("telecom.route inspect");
  const output = [
    "ZCOMM / TELECOM",
    "profile: ZLB2 telecom.local",
    "posture: DEFAULT-DENY",
    "link: LOCAL OBSERVATION",
    scanRequested ? "band: UHF · fixture spectrum only" : "band: not requested",
    routeRequested ? "route: READ-ONLY · no carrier selected" : "route: not requested",
    `transmit: ${txDenied ? "DENIED" : "NOT REQUESTED"}`,
    "HALT: linked",
  ].join("\n");

  return {
    output,
    status: "ACCEPTED",
    detail: "ZLB2 telecom.local · observe · HALT",
    normalized,
    capabilities: CAPABILITIES,
  };
}

export function telecomZlangTemplate(): string {
  return [
    "telecom.status",
    "telecom.scan band=uhf",
    "telecom.route inspect",
    "telecom.tx deny",
    "halt",
  ].join("\n");
}
