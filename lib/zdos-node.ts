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
 * Identity reported by the user's VPS enrollment command.
 * This is metadata only: no password, token, IP address or SSH key is stored.
 */
export const PRIVATE_ZDOS_NODE: ZdosNodeProfile = {
  schema: "zdos-node/v1",
  profile: "zdos.microcosm.beta",
  nodeId: "ZNODE-FF0A135D12F83F61",
  nodeName: "vmi3082470.contaboserver.net",
  os: "Ubuntu 22.04",
  kernel: "Linux 5.15.0-190-generic",
  posture: "DEFAULT-DENY",
  transport: "not-configured",
  capabilities: ["node.status", "evidence.append", "manifest.preview"],
  remoteExecution: false,
  networkExposure: false,
};

export function nodeBindingState(node: ZdosNodeProfile): "IDENTIFIED" | "UNLINKED" {
  return node.nodeId && node.nodeName ? "IDENTIFIED" : "UNLINKED";
}
