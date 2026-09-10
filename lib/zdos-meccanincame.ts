export type MeccanincameStatus = "LOCAL_READY" | "PAIRED_LOCAL" | "DENIED";
export type MeccanincameState = {
  schema: "zdos-meccanincame/v1";
  status: MeccanincameStatus;
  deviceName: string;
  peerName: string | null;
  network: "DENIED";
  shell: "DENIED";
  transport: "LOCAL_ONLY";
  capabilities: readonly ["device.status", "pair.local"];
};

const CAPABILITIES = ["device.status", "pair.local"] as const;

export const MECCANINCAME_TEMPLATE = [
  "meccanincame.status",
  "meccanincame.pair.local",
  "meccanincame.shell deny",
  "meccanincame.network deny",
  "halt",
].join("\n");

export function emptyMeccanincameState(deviceName = "MICROCOSM"): MeccanincameState {
  return {
    schema: "zdos-meccanincame/v1",
    status: "LOCAL_READY",
    deviceName: deviceName.trim().slice(0, 32) || "MICROCOSM",
    peerName: null,
    network: "DENIED",
    shell: "DENIED",
    transport: "LOCAL_ONLY",
    capabilities: CAPABILITIES,
  };
}

export function pairMeccanincameLocally(state: MeccanincameState, peerName: string): MeccanincameState {
  const cleanPeer = peerName.trim().slice(0, 32);
  if (!cleanPeer) return state;
  return { ...state, status: "PAIRED_LOCAL", peerName: cleanPeer };
}

export function runMeccanincameZlang(source: string): { status: "ACCEPTED" | "DENIED"; output: string; detail: string } {
  const normalized = source.split("\n").map((line) => line.trim().toLowerCase()).filter(Boolean).join("\n");
  const supported = new Set(MECCANINCAME_TEMPLATE.split("\n"));
  const lines = normalized.split("\n").filter(Boolean);
  if (!lines.length || lines.some((line) => !supported.has(line))) {
    return { status: "DENIED", output: "DENIED: external connection, shell and arbitrary transport are unavailable.", detail: "syntax outside meccanincame.local profile" };
  }
  if (!lines.includes("meccanincame.status") || !lines.includes("halt")) {
    return { status: "DENIED", output: "DENIED: status and halt are mandatory", detail: "meccanincame profile requires status and HALT" };
  }
  return {
    status: "ACCEPTED",
    output: ["MECCANINCAME / ZLANG BY ZDOS", "transport: LOCAL_ONLY", "pairing: LOCAL CONSENT", "network: DENIED", "shell: DENIED", "HALT: linked"].join("\n"),
    detail: "ZLB2 meccanincame.local · local pairing · HALT",
  };
}
