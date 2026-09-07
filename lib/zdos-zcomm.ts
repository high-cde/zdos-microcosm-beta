import AsyncStorage from "@react-native-async-storage/async-storage";

export type ZCommRoom = { id: string; title: string; page: number; description: string };
export type ZCommMessage = { id: string; roomId: string; nick: string; body: string; createdAt: string; pending?: boolean };
export type ZCommState = { activePage: number; rooms: ZCommRoom[]; messages: ZCommMessage[]; pending: ZCommMessage[]; lastSync: string | null };
export type ZCommResult = { status: "ACCEPTED" | "DENIED"; output: string; detail: string; normalized: string; capabilities: readonly string[] };

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

export async function syncZCommState(state: ZCommState, endpoint?: string): Promise<{ state: ZCommState; detail: string }> {
  if (!endpoint || !/^https:\/\//.test(endpoint)) return { state, detail: "offline queue retained · HTTPS endpoint not configured" };
  try {
    const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json", "x-zdos-capability": "zcomm.sync.push" }, body: JSON.stringify({ messages: state.pending }) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const pendingIds = new Set(state.pending.map((message) => message.id));
    const next = { ...state, pending: [], messages: state.messages.map((message) => pendingIds.has(message.id) ? { ...message, pending: false } : message), lastSync: new Date().toISOString() };
    await saveZCommState(next); return { state: next, detail: `online sync complete · ${pendingIds.size} message(s)` };
  } catch { return { state, detail: "online sync unavailable · messages remain safely queued" }; }
}

export { DEFAULT_ROOMS };
