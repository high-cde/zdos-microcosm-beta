import crypto from "node:crypto";
import type { Express, Request, Response } from "express";

export const ZDOS_NODE_CONTRACT = `module zdos.microcosm.node

policy DEFAULT-DENY
capability status.read
capability manifest.read
capability evidence.append
capability shell.deny
capability radio.deny
capability tx.deny
capability crypto.deny

func main() {
  status.read()
  halt()
}`;

function nodeUrl(): URL | null {
  const raw = process.env.ZDOS_NODE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

function validNodeToken(req: Request): boolean {
  const configured = process.env.ZDOS_NODE_TOKEN;
  if (!configured) return false;
  const received = req.header("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(received);
  const b = Buffer.from(configured);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function readNode(path: string) {
  const base = nodeUrl();
  if (!base) return { ok: false as const, code: "NODE_NOT_CONFIGURED" };
  const target = new URL(path, base);
  if (target.protocol !== "https:" || target.hostname !== base.hostname) return { ok: false as const, code: "NODE_URL_DENIED" };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_000);
  try {
    const response = await fetch(target, {
      method: "GET",
      headers: { accept: "application/json", "user-agent": "ZDOS-Microcosm-NodeClient/1" },
      signal: controller.signal,
    });
    if (!response.ok) return { ok: false as const, code: `NODE_HTTP_${response.status}` };
    return { ok: true as const, data: await response.json() };
  } catch {
    return { ok: false as const, code: "NODE_UNREACHABLE" };
  } finally {
    clearTimeout(timeout);
  }
}

export function registerZdosNodeRoutes(app: Express) {
  app.get("/api/zdos/node/contract", (_req, res) => {
    res.json({ ok: true, runtime: "ZLANG-BY-ZDOS", mode: "READ-ONLY", contract: ZDOS_NODE_CONTRACT });
  });

  app.get("/api/zdos/node/status", async (req, res) => {
    if (!validNodeToken(req)) {
      res.status(process.env.ZDOS_NODE_TOKEN ? 401 : 503).json({ ok: false, code: process.env.ZDOS_NODE_TOKEN ? "UNAUTHORIZED" : "NODE_TOKEN_NOT_CONFIGURED" });
      return;
    }
    res.json(await readNode("/api/health"));
  });

  app.get("/api/zdos/node/manifest", async (req, res) => {
    if (!validNodeToken(req)) {
      res.status(process.env.ZDOS_NODE_TOKEN ? 401 : 503).json({ ok: false, code: process.env.ZDOS_NODE_TOKEN ? "UNAUTHORIZED" : "NODE_TOKEN_NOT_CONFIGURED" });
      return;
    }
    res.json(await readNode("/api/manifest"));
  });
}
