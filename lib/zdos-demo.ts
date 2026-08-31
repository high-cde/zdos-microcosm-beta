export type ReceiptStatus = "READY" | "VERIFIED" | "ACCEPTED" | "DENIED" | "ROADMAP";

export type DemoResult = {
  output: string;
  status: ReceiptStatus;
  detail: string;
};

export type Receipt = {
  id: string;
  operation: string;
  status: ReceiptStatus;
  detail: string;
};

export function runTerminalCommand(input: string): DemoResult {
  const command = input.trim().toLowerCase();
  switch (command) {
    case "help":
      return { output: "help   status   zlang\nzretro evidence deny", status: "READY", detail: "supported demo commands" };
    case "status":
      return { output: "identity: guest\nmode: offline-first\nnetwork: denied\nstorage: ./workspace only", status: "READY", detail: "system posture inspected" };
    case "zlang":
      return { output: "ZLB2 v2.5\nemit profile: valid\nHALT: linked", status: "ACCEPTED", detail: "ZLB2 v2.5 · emit · HALT" };
    case "zretro":
      return { output: "Meteor Patrol\nIR: ready\nmanifest: prepared", status: "VERIFIED", detail: "IR READY · manifest prepared" };
    case "evidence":
      return { output: "local receipts are available\nhash chain: linked", status: "READY", detail: "session receipts inspected" };
    case "deny":
      return { output: "DENIED: capability not granted\nNo operation attempted.", status: "DENIED", detail: "default-deny profile enforced" };
    default:
      return { output: `DENIED: command '${input.trim()}' outside supported profile`, status: "DENIED", detail: "command outside supported profile" };
  }
}

export function validateZlang(source: string): DemoResult {
  return source.trimStart().startsWith("emit ")
    ? { output: "ZLB2 v2.5 profile accepted", status: "ACCEPTED", detail: "ZLB2 v2.5 · emit · HALT" }
    : { output: "profile rejected by default-deny parser", status: "DENIED", detail: "syntax outside supported profile" };
}

export function previewZretro(_manifest: string): DemoResult {
  return { output: "IR READY", status: "VERIFIED", detail: "IR READY · manifest prepared" };
}

export function createReceipt(operation: string, result: DemoResult, id = `${operation}-${Date.now()}`): Receipt {
  return { id, operation, status: result.status, detail: result.detail };
}

export function computeZtrace(surface: string, receiptCount: number): string {
  const input = `zdos.microcosm.beta|DEFAULT-DENY|${surface}|${receiptCount}`;
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `ZTRACE-${(hash >>> 0).toString(16).padStart(8, "0").toUpperCase()}`;
}
