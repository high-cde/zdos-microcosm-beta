import AsyncStorage from "@react-native-async-storage/async-storage";

import { computeZtrace, type Receipt, type ReceiptStatus } from "./zdos-demo";

export type ZdosRuntimeState = {
  version: 1;
  nodeId: string;
  bootId: string;
  bootedAt: string;
  posture: "DEFAULT-DENY";
  transport: "local-only";
  remoteExecution: false;
  networkExposure: false;
  receipts: Receipt[];
  chainHead: string;
};

const STORAGE_KEY = "zdos.runtime.v1";
const NODE_ID = "LOCAL-APP";

function chainHead(receipts: Receipt[]): string {
  return computeZtrace("evidence-chain", receipts.length) + ":" + (receipts.at(-1)?.id ?? "GENESIS");
}

export function createRuntimeState(now = new Date().toISOString()): ZdosRuntimeState {
  const bootId = `boot-${now.replace(/[^0-9]/g, "").slice(0, 14)}`;
  const receipts: Receipt[] = [{ id: bootId, operation: "microcosm.boot", status: "READY", detail: "local runtime initialized · default-deny posture" }];
  return { version: 1, nodeId: NODE_ID, bootId, bootedAt: now, posture: "DEFAULT-DENY", transport: "local-only", remoteExecution: false, networkExposure: false, receipts, chainHead: chainHead(receipts) };
}

export function appendRuntimeReceipt(state: ZdosRuntimeState, receipt: Omit<Receipt, "id">, now = Date.now()): ZdosRuntimeState {
  const nextReceipt: Receipt = { ...receipt, id: `${receipt.operation}-${now}` };
  const receipts = [...state.receipts, nextReceipt];
  return { ...state, receipts, chainHead: chainHead(receipts) };
}

export function verifyRuntimeState(state: ZdosRuntimeState): boolean {
  return state.version === 1 && state.nodeId === NODE_ID && state.posture === "DEFAULT-DENY" && state.transport === "local-only" && state.remoteExecution === false && state.networkExposure === false && state.receipts.length > 0 && state.chainHead === chainHead(state.receipts);
}

export async function loadRuntimeState(): Promise<ZdosRuntimeState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return createRuntimeState();
    const parsed = JSON.parse(raw) as ZdosRuntimeState;
    return verifyRuntimeState(parsed) ? parsed : createRuntimeState();
  } catch {
    return createRuntimeState();
  }
}

export async function saveRuntimeState(state: ZdosRuntimeState): Promise<void> {
  if (!verifyRuntimeState(state)) throw new Error("refusing to persist invalid ZDOS runtime state");
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function recordRuntimeReceipt(state: ZdosRuntimeState, receipt: Omit<Receipt, "id">): Promise<ZdosRuntimeState> {
  const next = appendRuntimeReceipt(state, receipt);
  await saveRuntimeState(next);
  return next;
}

export function runtimeStatus(state: ZdosRuntimeState) {
  return { nodeId: state.nodeId, posture: state.posture, transport: state.transport, receipts: state.receipts.length, chain: state.chainHead, healthy: verifyRuntimeState(state) } as const;
}

export type RuntimeReceiptStatus = ReceiptStatus;
