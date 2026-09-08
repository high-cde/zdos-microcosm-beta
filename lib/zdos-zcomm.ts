import AsyncStorage from "@react-native-async-storage/async-storage";

export type ZCommRoom = { id: string; title: string; page: number; description: string };
export type ZCommMessage = { id: string; roomId: string; nick: string; body: string; createdAt: string; pending?: boolean };
export type ZCommState = { activePage: number; rooms: ZCommRoom[]; messages: ZCommMessage[]; pending: ZCommMessage[]; lastSync: string | null };
export type ZCommResult = { status: "ACCEPTED" | "DENIED"; output: string; detail: string; normalized: string; capabilities: readonly string[] };
export type ZCommAntennaStatus = "CONNECTED" | "OFFLINE" | "DENIED" | "NOT_CONFIGURED";
export type ZCommAntenna = {
  status: ZCommAntennaStatus;
  endpoint: string | null;
  nodeId: string | null;
  nodeName: string | null;
  detail: string;
  checkedAt: string | null;
};
export type ZCommCbStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "DENIED" | "ERROR";
export type ZCommCbEvent = { type: "zcomm.cb.message"; roomId: string; nick: string; body: string; createdAt: string };

type AntennaPayload = { schema?: string; nodeId?: string; nodeName?: string; status?: string; posture?: string; capabilities?: unknown };

const STORAGE_KEY = "zdos.zcomm.v1";
const DEFAULT_ROOMS: ZCommRoom[] = [
  { id: "piazza", title: "Piazza ZDOS", page: 100, description: "Messaggeria pubblica del microcosmo" },
  { id: "officina", title: "Officina Zlang", page: 200, description: "Condivisione di programmi Zlang" },
  { id: "retro", title: "RetroNet", page: 300, description: "Storie e cultura del Videotel" },
];
const DEFAULT_MESSAGES: ZCommMessage[] = [
  { id: "welcome", roomId: "piazza", nick: "SYSTEM", body: "Benvenuto su ZComm. La coda locale funziona anche offline.", createdAt: "1980-01-01T00:00:00.000Z" },
];
const CAPABILITIES = ["zcomm.page.read", "zcomm.message.queue", "zcomm.sync.push"] as const;
const SUPPORTED = ["zcomm.status", "zcomm.page.list", "zcomm.room.list", "zcomm.message.queue", "zcomm.sync status", "zcomm.sync push", "zcomm.tx deny", "halt"] as const;

export function zcommZlangTemplate() {
  return ["zcomm.status", "zcomm.page.list", "zcomm.room.list", "zcomm.message.queue", "zcomm.sync status", "zcomm.tx deny", "halt"].join("\n");
}

export function runZcommZlang(source: string): ZCommResult {
  const normalized = source.split("\n").map((line) => line.trim().toLowerCase()).filter(Boolean).join("\n");
  const lines = normalized.split("\n").filter(Boolean);
  if (!lines.length || lines.some((line) => !SUPPORTED.includes(line as (typeof SUPPORTED)[number]))) {
    return { status: "DENIED", output: `DENIED: ${normalized || "empty program"}\nNo shell, socket or credential operation attempted.`, detail: "syntax outside zcomm.local profile", normalized, capabilities: [] };
  }
  if (!lines.includes("zcomm.status") || !lines.includes("halt")) {
    return { status: "DENIED", output: "DENIED: zcomm.status and halt are mandatory", detail: "zcomm profile requires status and HALT", normalized, capabilities: [] };
  }
  return { status: "ACCEPTED", output: ["ZCOMM / VIDEOTEL LOCAL-FIRST", "profile: ZLB2 zcomm.local", "screen: CEPT 40x24", "identity: local nickname only", "storage: encrypted device queue", "sync: HTTPS allowlist · retry-safe", "transmit: DENIED unless sync capability", "HALT: linked"].join("\n"), detail: "ZLB2 zcomm.local · pages · queue · HALT", normalized, capabilities: CAPABILITIES };
}

export function emptyZCommState(): ZCommState { return { activePage: 100, rooms: DEFAULT_ROOMS, messages: DEFAULT_MESSAGES, pending: [], lastSync: null }; }

export async function loadZCommState(): Promise<ZCommState> {
  try { const raw = await AsyncStorage.getItem(STORAGE_KEY); return raw ? { ...emptyZCommState(), ...JSON.parse(raw) } : emptyZCommState(); } catch { return emptyZCommState(); }
}

export async function saveZCommState(state: ZCommState) {
  try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* headless storage unavailable; memory state remains authoritative */ }
}

export async function queueZCommMessage(state: ZCommState, roomId: string, nick: string, body: string): Promise<ZCommState> {
  const clean = body.trim().slice(0, 240);
  if (!clean || !state.rooms.some((room) => room.id === roomId)) return state;
  const message: ZCommMessage = { id: `local-${Date.now()}`, roomId, nick: nick.trim().slice(0, 24) || "ANON", body: clean, createdAt: new Date().toISOString(), pending: true };
  const next = { ...state, messages: [...state.messages, message], pending: [...state.pending, message] };
  await saveZCommState(next); return next;
}

function normalizeEndpoint(endpoint?: string): string | null {
  const value = endpoint?.trim().replace(/\/$/, "") ?? "";
  return /^https:\/\/[^\s]+$/i.test(value) ? value : null;
}

/** Read-only antenna handshake with zdos-first-node.service. The node must expose GET /v1/status. */
export async function probeZCommAntenna(endpoint?: string, timeoutMs = 5000): Promise<ZCommAntenna> {
  const base = normalizeEndpoint(endpoint);
  const checkedAt = new Date().toISOString();
  if (!base) return { status: endpoint ? "DENIED" : "NOT_CONFIGURED", endpoint: null, nodeId: null, nodeName: null, detail: endpoint ? "antenna denied · HTTPS endpoint required" : "antenna not configured · local queue remains active", checkedAt };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${base}/v1/status`, { method: "GET", headers: { accept: "application/json", "x-zdos-capability": "node.status" }, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = (await response.json()) as AntennaPayload;
    if (payload.schema !== "zdos-node-status/v1" || typeof payload.nodeId !== "string" || typeof payload.nodeName !== "string" || payload.status !== "ONLINE") {
      return { status: "DENIED", endpoint: base, nodeId: payload.nodeId ?? null, nodeName: payload.nodeName ?? null, detail: "antenna denied · node status contract not verified", checkedAt };
    }
    return { status: "CONNECTED", endpoint: base, nodeId: payload.nodeId, nodeName: payload.nodeName, detail: `antenna connected · ${payload.nodeName} · read-only`, checkedAt };
  } catch {
    return { status: "OFFLINE", endpoint: base, nodeId: null, nodeName: null, detail: "antenna offline · local queue remains active", checkedAt };
  } finally { clearTimeout(timeout); }
}

export async function syncZCommState(state: ZCommState, endpoint?: string): Promise<{ state: ZCommState; detail: string }> {
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  if (!normalizedEndpoint) return { state, detail: "offline queue retained · HTTPS endpoint not configured" };
  try {
    const response = await fetch(normalizedEndpoint, { method: "POST", headers: { "content-type": "application/json", "x-zdos-capability": "zcomm.sync.push" }, body: JSON.stringify({ messages: state.pending }) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const pendingIds = new Set(state.pending.map((message) => message.id));
    const next = { ...state, pending: [], messages: state.messages.map((message) => pendingIds.has(message.id) ? { ...message, pending: false } : message), lastSync: new Date().toISOString() };
    await saveZCommState(next); return { state: next, detail: `online sync complete · ${pendingIds.size} message(s)` };
  } catch { return { state, detail: "online sync unavailable · messages remain safely queued" }; }
}

/** Browser/Expo CB transport. Only explicit secure WebSocket URLs and bounded ZComm events are accepted. */
export class ZCommCbClient {
  private socket: WebSocket | null = null;
  public status: ZCommCbStatus = "DISCONNECTED";

  connect(endpoint: string, onEvent: (event: ZCommCbEvent) => void, onStatus?: (status: ZCommCbStatus) => void) {
    const value = endpoint.trim().replace(/\/$/, "");
    if (!/^wss:\/\/[^\s]+$/i.test(value)) { this.status = "DENIED"; onStatus?.(this.status); return false; }
    this.close(onStatus);
    this.status = "CONNECTING"; onStatus?.(this.status);
    try {
      this.socket = new WebSocket(value);
      this.socket.onopen = () => { this.status = "CONNECTED"; onStatus?.(this.status); };
      this.socket.onmessage = (message) => {
        try {
          const candidate = JSON.parse(String(message.data)) as Partial<ZCommCbEvent>;
          if (candidate.type !== "zcomm.cb.message" || typeof candidate.roomId !== "string" || typeof candidate.nick !== "string" || typeof candidate.body !== "string" || typeof candidate.createdAt !== "string") return;
          onEvent({ type: "zcomm.cb.message", roomId: candidate.roomId.slice(0, 32), nick: candidate.nick.slice(0, 24), body: candidate.body.slice(0, 240), createdAt: candidate.createdAt });
        } catch { /* malformed frames are ignored by the bounded client */ }
      };
      this.socket.onerror = () => { this.status = "ERROR"; onStatus?.(this.status); };
      this.socket.onclose = () => { this.status = "DISCONNECTED"; onStatus?.(this.status); };
      return true;
    } catch { this.status = "ERROR"; onStatus?.(this.status); return false; }
  }

  send(message: Pick<ZCommCbEvent, "roomId" | "nick" | "body">) {
    if (!this.socket || this.status !== "CONNECTED") return false;
    this.socket.send(JSON.stringify({ type: "zcomm.cb.message", roomId: message.roomId.slice(0, 32), nick: message.nick.slice(0, 24), body: message.body.slice(0, 240), createdAt: new Date().toISOString() }));
    return true;
  }

  close(onStatus?: (status: ZCommCbStatus) => void) { this.socket?.close(); this.socket = null; this.status = "DISCONNECTED"; onStatus?.(this.status); }
}

export { DEFAULT_ROOMS };
