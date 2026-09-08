import { servicePageForCode, ZCOMM_COLUMNS, ZCOMM_NODE_ID } from "./zcomm-videotex";

export const ZCOMM_SERVICE_SCHEMA = "zdos.zcomm.catalog.v1" as const;

export type ZcommServicePage = {
  code: string;
  title: string;
  rows: string[];
  capability: "zcomm.page.read";
};

const PAGES: readonly ZcommServicePage[] = [
  {
    code: "*01#",
    title: "ZDOS STATUS",
    rows: ["NODE core-01", "POLICY DEFAULT-DENY", "HEARTBEAT PUBLIC HTTPS", "CAPABILITY READ-ONLY"],
    capability: "zcomm.page.read",
  },
  {
    code: "*02#",
    title: "ZLANG RUNTIME",
    rows: ["PROFILE ZLB2 v2.5", "VALIDATOR DETERMINISTIC", "BYTECODE EXECUTION DENIED", "HALT LINKED"],
    capability: "zcomm.page.read",
  },
  {
    code: "*03#",
    title: "EVIDENCE CHAIN",
    rows: ["LOCAL RECEIPTS", "APPEND-ONLY ROADMAP", "READ-ONLY SERVICE", "ATTESTATION OBSERVABLE"],
    capability: "zcomm.page.read",
  },
];

function boundedRows(rows: string[]) {
  return rows.map((row) => row.slice(0, ZCOMM_COLUMNS));
}

export function getZcommCatalog() {
  return {
    schema: ZCOMM_SERVICE_SCHEMA,
    node_id: ZCOMM_NODE_ID,
    policy: "DEFAULT-DENY",
    capabilities: ["zcomm.catalog.read", "zcomm.page.read"] as const,
    pages: PAGES.map((page) => ({ ...page, rows: boundedRows(page.rows) })),
    execution: "DENIED",
    transport: "HTTPS-READ-ONLY",
  };
}

export function getZcommServicePage(code: string) {
  const normalized = code.trim();
  const page = PAGES.find((item) => item.code === normalized);
  if (!page) {
    return {
      found: false as const,
      code: normalized,
      title: servicePageForCode(normalized),
      rows: [] as string[],
      detail: "service code not found in the read-only ZComm catalog",
    };
  }
  return {
    found: true as const,
    ...page,
    rows: boundedRows(page.rows),
    detail: `${page.code} served by ZComm catalog · read-only`,
  };
}
