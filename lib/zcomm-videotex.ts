export const ZCOMM_PROFILE = "zdos.videotex.native.v1";
export const ZCOMM_COLUMNS = 40;
export const ZCOMM_ROWS = 24;
export const ZCOMM_NODE_ID = "core-01";

export type ZcommOperation = "STATUS" | "EMIT" | "STORAGE_READ" | "ATTEST";
export type ZcommResultStatus = "READY" | "ACCEPTED" | "DENIED";

export type ZcommResult = {
  status: ZcommResultStatus;
  operation: ZcommOperation | null;
  detail: string;
};

export const VIDEOTEX_ZLANG_SOURCE = `# ZDOS Native Videotex Terminal Specification
# Profilo ZLB2 v2.5 - Target ZDOS Microcosm
status node.profile
emit +----------------------------------------+
emit |         ZDOS VIDEOTEX v1.0             |
emit |      [01] ZDOS Status                  |
emit |      [02] Zlang Runtime                |
emit |      [03] Evidence Chain Ledger        |
emit +----------------------------------------+
emit Inserisci codice servizio (*Pagina#):
storage.read ".videotex_index"
attest videotex.session.initialized`;

const COMMANDS: Array<{ pattern: RegExp; operation: ZcommOperation }> = [
  { pattern: /^status node\.profile$/, operation: "STATUS" },
  { pattern: /^emit .+$/, operation: "EMIT" },
  { pattern: /^storage\.read "\.videotex_index"$/, operation: "STORAGE_READ" },
  { pattern: /^attest videotex\.session\.initialized$/, operation: "ATTEST" },
];

export function validateZcommLine(line: string): ZcommResult {
  const source = line.trim();
  const match = COMMANDS.find((command) => command.pattern.test(source));
  if (!match) {
    return {
      status: "DENIED",
      operation: null,
      detail: "ZComm accepts only the bounded Videotex contract",
    };
  }
  return {
    status: match.operation === "EMIT" ? "ACCEPTED" : "READY",
    operation: match.operation,
    detail: `${match.operation} accepted · ${ZCOMM_PROFILE} · local policy check`,
  };
}

export function validateVideotexProgram(source = VIDEOTEX_ZLANG_SOURCE): ZcommResult[] {
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map(validateZcommLine);
}

export function servicePageForCode(code: string) {
  const normalized = code.trim().replace(/^\*/, "").replace(/#$/, "");
  if (normalized === "01") return "ZDOS STATUS · core-01 · DEFAULT-DENY";
  if (normalized === "02") return "ZLANG RUNTIME · ZLB2 v2.5 · HALT LINKED";
  if (normalized === "03") return "EVIDENCE CHAIN · LOCAL RECEIPTS · READ-ONLY";
  return "SERVICE CODE NOT FOUND · use *01#, *02# or *03#";
}

export function isFixedGridLine(line: string) {
  return line.length <= ZCOMM_COLUMNS;
}
