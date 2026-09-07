import crypto from "node:crypto";
import type { Express, Request, Response } from "express";

const ZCOMM_CONTRACT = "ZLANG ZDOS ZCOMM SIP-VIDEO-TEL V23 PAGE-40X24 DEFAULT-DENY HALT";
const MAX_MESSAGE_LENGTH = 240;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const sessions = new Map<string, { nickname: string; createdAt: number }>();
const buckets = new Map<string, { startedAt: number; count: number }>();
const messages: Array<{ id: string; nickname: string; text: string; createdAt: number }> = [];

function digest(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function page(number: number, body: string) {
  return {
    protocol: "SIP-VIDEOTEL",
    transport: "HTTPS/TEXT",
    page: number,
    columns: 40,
    rows: 24,
    baudProfile: { down: 1200, up: 75 },
    contract: ZCOMM_CONTRACT,
    body: body.slice(0, 960),
    tx: "DENY-HARDWARE",
    execution: "NONE",
  };
}

function clientKey(req: Request): string {
  return String(req.headers["x-forwarded-for"] ?? req.socket.remoteAddress ?? "unknown").split(",")[0];
}

function allowedRate(req: Request): boolean {
  const key = clientKey(req);
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    buckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= MAX_REQUESTS_PER_WINDOW;
}

function bearerOk(req: Request): boolean {
  const configured = process.env.ZCOMM_API_TOKEN;
  if (!configured) return false;
  const received = req.header("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(received);
  const b = Buffer.from(configured);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function requireOnlineAccess(req: Request, res: Response): boolean {
  if (!allowedRate(req)) {
    res.status(429).json({ ok: false, code: "RATE_LIMITED" });
    return false;
  }
  if (!bearerOk(req)) {
    res.status(process.env.ZCOMM_API_TOKEN ? 401 : 503).json({
      ok: false,
      code: process.env.ZCOMM_API_TOKEN ? "UNAUTHORIZED" : "ZCOMM_NOT_CONFIGURED",
    });
    return false;
  }
  return true;
}

export function registerZcommRoutes(app: Express) {
  app.get("/api/zcomm/status", (_req, res) => {
    res.json({
      ok: true,
      service: "zcomm",
      mode: "ONLINE-TEXT-ONLY",
      protocol: "SIP-VIDEOTEL",
      contract: ZCOMM_CONTRACT,
      pages: [101, 165, 777],
      tx: "DENIED",
      radio: "DENIED",
      shell: "DENIED",
      runtime: "ZLANG-BY-ZDOS",
      configured: Boolean(process.env.ZCOMM_API_TOKEN),
    });
  });

  app.post("/api/zcomm/session", (req, res) => {
    if (!requireOnlineAccess(req, res)) return;
    const nickname = typeof req.body?.nickname === "string" ? req.body.nickname.trim() : "";
    if (!/^[A-Za-z0-9_ -]{2,24}$/.test(nickname)) {
      res.status(400).json({ ok: false, code: "INVALID_NICKNAME" });
      return;
    }
    const sessionId = crypto.randomBytes(18).toString("base64url");
    sessions.set(sessionId, { nickname, createdAt: Date.now() });
    res.json({ ok: true, sessionId, page: page(101, "ZCOMM ONLINE\n*165# MESSAGGERIE\n*777# STATUS\n# EXIT") });
  });

  app.post("/api/zcomm/page", (req, res) => {
    if (!requireOnlineAccess(req, res)) return;
    const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : "";
    if (!sessions.has(sessionId)) {
      res.status(401).json({ ok: false, code: "INVALID_SESSION" });
      return;
    }
    const command = typeof req.body?.command === "string" ? req.body.command.trim() : "";
    if (!/^\*\d{1,4}#$/.test(command) && command !== "# EXIT") {
      res.status(400).json({ ok: false, code: "INVALID_PAGE_COMMAND" });
      return;
    }
    const number = command === "# EXIT" ? 0 : Number(command.slice(1, -1));
    const body = number === 165 ? "MESSAGGERIE ZCOMM\n*180# SCRIVI\n*181# LEGGI\n# EXIT" : number === 777 ? "STATUS\nONLINE-TEXT-ONLY\nTX DENIED\nRADIO DENIED" : number === 0 ? "SESSION CLOSED" : "PAGE NOT FOUND\n*101# HOME";
    res.json({ ok: true, page: page(number, body) });
  });

  app.post("/api/zcomm/message", (req, res) => {
    if (!requireOnlineAccess(req, res)) return;
    const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : "";
    const session = sessions.get(sessionId);
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!session) return void res.status(401).json({ ok: false, code: "INVALID_SESSION" });
    if (!text || text.length > MAX_MESSAGE_LENGTH || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text)) {
      return void res.status(400).json({ ok: false, code: "INVALID_MESSAGE" });
    }
    const message = { id: digest(`${sessionId}:${Date.now()}:${text}`).slice(0, 24), nickname: session.nickname, text, createdAt: Date.now() };
    messages.push(message);
    while (messages.length > 200) messages.shift();
    res.status(201).json({ ok: true, message, evidence: digest(JSON.stringify(message)) });
  });
}
