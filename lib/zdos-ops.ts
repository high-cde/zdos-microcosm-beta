export type OperationalState = "NOMINAL" | "DEGRADED" | "UNKNOWN";

export type ResourceSnapshot = {
  key: string;
  label: string;
  value: string;
  state: OperationalState;
  detail: string;
};

export type NodeOperationalSnapshot = {
  posture: "LOCAL / DEFAULT-DENY";
  state: OperationalState;
  gps: "LOCAL-ONLY";
  radio: "OBSERVE-ONLY";
  network: "DENIED";
  resources: ResourceSnapshot[];
};

/**
 * Deterministic local snapshot for the Microcosm dashboard.
 * Values are explicitly marked as fixtures: no sensors, GPS or radio are queried.
 */
export function getLocalOperationalSnapshot(): NodeOperationalSnapshot {
  return {
    posture: "LOCAL / DEFAULT-DENY",
    state: "NOMINAL",
    gps: "LOCAL-ONLY",
    radio: "OBSERVE-ONLY",
    network: "DENIED",
    resources: [
      { key: "PWR", label: "POWER", value: "STABLE", state: "NOMINAL", detail: "local fixture" },
      { key: "WTR", label: "WATER", value: "UNKNOWN", state: "UNKNOWN", detail: "sensor not connected" },
      { key: "COM", label: "COMMS", value: "QUEUED", state: "DEGRADED", detail: "no transmitter granted" },
    ],
  };
}

export function describeCapabilityAction(action: "gps.read" | "radio.tx" | "message.queue") {
  switch (action) {
    case "gps.read":
      return { status: "READY" as const, detail: "local-only read; sharing remains denied" };
    case "message.queue":
      return { status: "READY" as const, detail: "message may be queued without transmission" };
    case "radio.tx":
      return { status: "DENIED" as const, detail: "transmit capability is not granted" };
  }
}
