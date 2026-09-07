export type ZcommCallState = "IDLE" | "DIALING" | "CONNECTED" | "ENDED" | "DENIED";

export type ZcommResult = {
  status: "ACCEPTED" | "DENIED";
  detail: string;
  output: string;
  normalized: string;
  capabilities: readonly string[];
};

const SUPPORTED_LINES = [
  "zcomm.status",
  "zcomm.video enable",
  "zcomm.audio enable",
  "zcomm.sip validate",
  "zcomm.call prepare",
  "zcomm.call end",
  "halt",
] as const;

const CAPABILITIES = ["zcomm.status", "zcomm.video", "zcomm.audio", "zcomm.sip.validate"] as const;

export const zcommZlangTemplate = (): string =>
  [
    "zcomm.status",
    "zcomm.video enable",
    "zcomm.audio enable",
    "zcomm.sip validate",
    "zcomm.call prepare",
    "halt",
  ].join("\n");

export function normalizeSipUri(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withScheme = trimmed.startsWith("sip:") ? trimmed : `sip:${trimmed}`;
  return /^sip:[^@\\s]+@[^@\\s]+$/.test(withScheme) ? withScheme : null;
}

export function runZcommZlang(source: string, sipUri: string): ZcommResult {
  const normalized = source
    .split("\n")
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean)
    .join("\n");
  const lines = normalized.split("\n").filter(Boolean);
  const target = normalizeSipUri(sipUri);

  if (!target) {
    return {
      status: "DENIED",
      detail: "SIP URI non valido: usare sip:utente@dominio",
      output: "DENIED: invalid SIP target\nExpected: sip:user@example.org\nNo call or network operation attempted.",
      normalized,
      capabilities: [],
    };
  }

  if (!lines.length || lines.some((line) => !SUPPORTED_LINES.includes(line as (typeof SUPPORTED_LINES)[number]))) {
    return {
      status: "DENIED",
      detail: "syntax outside zcomm Zlang allowlist",
      output: "DENIED: unsupported zcomm instruction\nNo call or network operation attempted.",
      normalized,
      capabilities: [],
    };
  }

  if (!lines.includes("zcomm.status") || !lines.includes("zcomm.sip validate") || !lines.includes("halt")) {
    return {
      status: "DENIED",
      detail: "zcomm profile requires status, sip validate and HALT",
      output: "DENIED: incomplete zcomm profile\nRequired: zcomm.status · zcomm.sip validate · halt",
      normalized,
      capabilities: [],
    };
  }

  const video = lines.includes("zcomm.video enable");
  const audio = lines.includes("zcomm.audio enable");
  const prepare = lines.includes("zcomm.call prepare");
  const end = lines.includes("zcomm.call end");
  return {
    status: "ACCEPTED",
    detail: "ZCOMM ZLANG BY ZDOS · local profile validated",
    output: [
      "ZCOMM / SIP VIDEO TELEPHONE",
      "runtime: zlang by zdos · zcomm.local",
      `target: ${target}`,
      `media: ${video ? "VIDEO" : "NO VIDEO"} + ${audio ? "AUDIO" : "NO AUDIO"}`,
      `call: ${prepare ? "PREPARE" : end ? "END" : "IDLE"}`,
      "transport: READY · explicit user action required",
      "security: DEFAULT-DENY · no hidden dialing",
      "HALT: linked",
    ].join("\n"),
    normalized,
    capabilities: CAPABILITIES,
  };
}
