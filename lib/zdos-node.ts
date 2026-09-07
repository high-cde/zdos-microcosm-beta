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

/** Local application profile. No host, IP, VPS or remote identity is stored. */
export const PRIVATE_ZDOS_NODE: ZdosNodeProfile = {
  schema: "zdos-node/v1",
  profile: "zdos.microcosm.beta",
  nodeId: "LOCAL-APP",
  nodeName: "local-app",
  os: "Expo client",
  kernel: "not-applicable",
  posture: "DEFAULT-DENY",
  transport: "not-configured",
  capabilities: ["node.status", "evidence.append", "manifest.preview"],
  remoteExecution: false,
  networkExposure: false,
};

export function nodeBindingState(node: ZdosNodeProfile): "IDENTIFIED" | "UNLINKED" {
  return node.nodeId && node.nodeName ? "IDENTIFIED" : "UNLINKED";
}
