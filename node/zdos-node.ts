import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";

export type NodePosture = "DEFAULT-DENY";
export type NodeMode = "OBSERVE" | "QUEUE";
export type NodeReceipt = { id: string; operation: string; status: "READY" | "ACCEPTED" | "DENIED"; detail: string; at: string };
export type NodeState = { version: 1; nodeId: string; name: string; posture: NodePosture; mode: NodeMode; tx: "DENIED"; network: "LOCAL-ONLY"; receipts: NodeReceipt[] };
export type RadioFrame = { id: string; adapter: string; direction: "RX"; payload: string; receivedAt: string; verified: false };

const DEFAULT_NODE_ID = process.env.ZDOS_NODE_ID || `VPS-${randomUUID().slice(0, 8).toUpperCase()}`;
const DATA_DIR = process.env.ZDOS_DATA_DIR || "/var/lib/zdos-node";
const STATE_FILE = join(DATA_DIR, "state.json");
const EVENT_FILE = join(DATA_DIR, "events.jsonl");
const HOST = process.env.ZDOS_NODE_HOST || "127.0.0.1";
const PORT = Number(process.env.ZDOS_NODE_PORT || 8787);

const now = () => new Date().toISOString();
const safeText = (value: unknown, max = 4096) => typeof value === "string" ? value.trim().slice(0, max) : "";

export function initialState(): NodeState {
  return { version: 1, nodeId: DEFAULT_NODE_ID, name: process.env.ZDOS_NODE_NAME || "zdos-vps-node", posture: "DEFAULT-DENY", mode: "OBSERVE", tx: "DENIED", network: "LOCAL-ONLY", receipts: [] };
}

export async function loadState(): Promise<NodeState> {
  try {
    const parsed = JSON.parse(await readFile(STATE_FILE, "utf8")) as NodeState;
    if (parsed.version === 1 && parsed.posture === "DEFAULT-DENY" && parsed.tx === "DENIED") return parsed;
  } catch {
    // First boot or unreadable state: create a fresh local state.
  }
  return initialState();
}

async function persist(state: NodeState): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await appendFile(EVENT_FILE, `${JSON.stringify({ type: "state", at: now(), state })}\n`);
  const { writeFile } = await import("node:fs/promises");
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2), { mode: 0o600 });
}

async function receipt(state: NodeState, operation: string, status: NodeReceipt["status"], detail: string): Promise<NodeState> {
  const next = { ...state, receipts: [...state.receipts, { id: `${operation}-${Date.now()}`, operation, status, detail, at: now() }].slice(-200) };
  await persist(next);
  return next;
}

export function evaluateZlang(source: string): { status: "ACCEPTED" | "DENIED"; output: string; detail: string; capabilities: string[] } {
  const lines = source.split("\n").map((line) => line.trim().toLowerCase()).filter(Boolean);
  const supported = new Set(["node.status", "node.capabilities", "gps.status", "radio.status", "radio.receive", "zcomm.queue", "evidence.commit", "halt"]);
  if (!lines.length || lines.some((line) => !supported.has(line))) return { status: "DENIED", output: "DENIED: syntax or capability outside node.local profile", detail: "default-deny evaluator rejected the program", capabilities: [] };
  if (!lines.includes("node.status") || !lines.includes("halt")) return { status: "DENIED", output: "DENIED: node.status and halt are mandatory", detail: "node profile requires status and HALT", capabilities: [] };
  if (lines.includes("radio.transmit") || lines.includes("radio.tx")) return { status: "DENIED", output: "DENIED: radio transmission capability is not granted", detail: "radio TX is permanently disabled in the base profile", capabilities: [] };
  const capabilities = ["node.status", "node.capabilities", ...(lines.includes("gps.status") ? ["gps.status"] : []), ...(lines.includes("radio.receive") ? ["radio.receive"] : []), ...(lines.includes("zcomm.queue") ? ["zcomm.queue"] : [])];
  return { status: "ACCEPTED", output: ["ZDOS NODE / LOCAL PROFILE", "posture: DEFAULT-DENY", "network: LOCAL-ONLY", "radio: RX-ONLY", "tx: DENIED", "HALT: linked"].join("\n"), detail: "Zlang node.local program accepted", capabilities };
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  let body = "";
  for await (const chunk of request) body += String(chunk);
  try { return JSON.parse(body || "{}") as Record<string, unknown>; } catch { return {}; }
}

function send(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(body));
}

export async function createNodeServer() {
  let state = await loadState();
  const server = createServer(async (request, response) => {
    const url = new URL(request.url || "/", `http://${HOST}:${PORT}`);
    if (request.method === "GET" && url.pathname === "/health") return send(response, 200, { ok: true, nodeId: state.nodeId, posture: state.posture, mode: state.mode });
    if (request.method === "GET" && url.pathname === "/v1/status") return send(response, 200, { ...state, receipts: state.receipts.slice(-20) });
    if (request.method === "POST" && url.pathname === "/v1/zlang") {
      const body = await readJson(request);
      const result = evaluateZlang(safeText(body.source));
      state = await receipt(state, "zlang.evaluate", result.status, result.detail);
      return send(response, 200, { ...result, node: state.nodeId });
    }
    if (request.method === "POST" && url.pathname === "/v1/radio/receive") {
      const body = await readJson(request);
      const payload = safeText(body.payload, 2048);
      if (!payload) return send(response, 400, { error: "payload required" });
      const frame: RadioFrame = { id: `rx-${Date.now()}`, adapter: safeText(body.adapter, 64) || "unknown", direction: "RX", payload, receivedAt: now(), verified: false };
      state = await receipt(state, "radio.receive", "ACCEPTED", "frame stored locally; payload remains untrusted");
      return send(response, 202, { frame, tx: state.tx });
    }
    if (request.method === "POST" && url.pathname === "/v1/radio/transmit") {
      state = await receipt(state, "radio.transmit", "DENIED", "radio TX is disabled by DEFAULT-DENY");
      return send(response, 403, { status: "DENIED", detail: "radio TX is disabled by DEFAULT-DENY" });
    }
    if (request.method === "POST" && url.pathname === "/v1/zcomm/queue") {
      const body = await readJson(request);
      const message = safeText(body.message, 240);
      if (!message) return send(response, 400, { error: "message required" });
      state = await receipt(state, "zcomm.queue", "ACCEPTED", "message queued locally; no transmission attempted");
      return send(response, 202, { status: "QUEUED", message, tx: state.tx });
    }
    return send(response, 404, { error: "not found" });
  });
  await mkdir(DATA_DIR, { recursive: true });
  state = await receipt(state, "node.boot", "READY", "headless VPS node started in DEFAULT-DENY");
  return { server, state: () => state };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { server } = await createNodeServer();
  server.listen(PORT, HOST, () => console.log(`ZDOS Node ${DEFAULT_NODE_ID} listening on ${HOST}:${PORT}`));
}
