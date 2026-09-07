export type ZdosNodeProfile = {
  schema: "zdos-node/v1";
  profile: "zdos.microcosm.beta";
  nodeId: string;
  nodeName: string;
  os: string;
  kernel: string;
  posture: "DEFAULT-DENY";
  transport: "not-configured";
  capabilities: readonly ["node.status", "evidence.append", "manifest.preview"];
  remoteExecution: false;
  networkExposure: false;
};

/**
 * Public node identity only. No VPS hostname, address, credential or private
 * enrollment metadata is stored in the client.
 */
export const PRIVATE_ZDOS_NODE: ZdosNodeProfile = {
  schema: "zdos-node/v1",
  profile: "zdos.microcosm.beta",
  nodeId: "core-01",
  nodeName: "core-01",
  os: "public-status-only",
  kernel: "not-disclosed",
  posture: "DEFAULT-DENY",
  transport: "not-configured",
  capabilities: ["node.status", "evidence.append", "manifest.preview"],
  remoteExecution: false,
  networkExposure: false,
};

export function nodeBindingState(node: ZdosNodeProfile): "IDENTIFIED" | "UNLINKED" {
  return node.nodeId && node.nodeName ? "IDENTIFIED" : "UNLINKED";
}
