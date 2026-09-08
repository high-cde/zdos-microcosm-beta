import { validateZcommLine } from "./zcomm-videotex";

export const ZLANG_VALIDATOR_SCHEMA = "zdos.zlang.validator.v1" as const;

export const ZLANG_PROFILES = [
  "zdos.zlang.microterm.v1",
  "zdos.videotex.native.v1",
  "zdos.evidence.append.v1",
] as const;

export type ZlangValidatorProfile = (typeof ZLANG_PROFILES)[number];

export type ZlangValidationResponse = {
  schema: typeof ZLANG_VALIDATOR_SCHEMA;
  profile: ZlangValidatorProfile;
  accepted: boolean;
  policy: "DEFAULT-DENY";
  operations: string[];
  denied: string[];
  detail: string;
  execution: "DENIED";
};

const MICROTERM_LINE = /^(help|emit .+)$/;
const EVIDENCE_LINE = /^(storage\.append "evidence\.receipt"|storage\.read "evidence\.recent"|attest evidence\.batch\.committed)$/;

function validateLine(profile: ZlangValidatorProfile, line: string) {
  const source = line.trim();
  if (profile === "zdos.videotex.native.v1") return validateZcommLine(source).status !== "DENIED";
  if (profile === "zdos.zlang.microterm.v1") return MICROTERM_LINE.test(source);
  return EVIDENCE_LINE.test(source);
}

export function validateZlangService(profile: string, source: string): ZlangValidationResponse {
  const selected = ZLANG_PROFILES.includes(profile as ZlangValidatorProfile) ? profile as ZlangValidatorProfile : null;
  const lines = source.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
  if (!selected) {
    return { schema: ZLANG_VALIDATOR_SCHEMA, profile: "zdos.zlang.microterm.v1", accepted: false, policy: "DEFAULT-DENY", operations: [], denied: lines, detail: "profile is not allowlisted", execution: "DENIED" };
  }
  const acceptedLines = lines.filter((line) => validateLine(selected, line));
  const deniedLines = lines.filter((line) => !validateLine(selected, line));
  return {
    schema: ZLANG_VALIDATOR_SCHEMA,
    profile: selected,
    accepted: lines.length > 0 && deniedLines.length === 0,
    policy: "DEFAULT-DENY",
    operations: acceptedLines,
    denied: deniedLines,
    detail: deniedLines.length === 0 ? "source accepted by deterministic allowlist" : "source contains instructions outside the selected profile",
    execution: "DENIED",
  };
}
