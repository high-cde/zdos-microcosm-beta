export type SipLabMethod = "REGISTER" | "OPTIONS" | "INVITE" | "BYE";

export type SipLabResult = {
  method: SipLabMethod;
  request: string;
  responses: string[];
  detail: string;
};

const SAFE_USER = /^[a-zA-Z0-9._+-]{1,48}$/;
const SAFE_DOMAIN = /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(?:\.(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?))*$/;

/** Generates a fictional SIP exchange entirely in memory; it never contacts a server. */
export function runSipLabScenario(method: SipLabMethod, username: string, domain: string): SipLabResult | null {
  const user = username.trim();
  const host = domain.trim();
  if (!SAFE_USER.test(user) || !SAFE_DOMAIN.test(host)) return null;

  const uri = `sip:${user}@${host}`;
  const baseHeaders = [
    `Via: SIP/2.0/UDP client.invalid:5060;branch=z9hG4bK-sip-lab-001`,
    `Max-Forwards: 70`,
    `From: <${uri}>;tag=local-tag-001`,
    `To: <${uri}>`,
    `Call-ID: local-call-001@sip-lab.invalid`,
    `CSeq: 1 ${method}`,
  ];

  let extraHeaders: string[] = [];
  let body = "";
  if (method === "REGISTER") {
    extraHeaders = [`Contact: <sip:${user}@client.invalid:5060>`, "Expires: 3600"];
  } else if (method === "INVITE") {
    body = [
      "v=0",
      "o=sip-lab 1 1 IN IP4 127.0.0.1",
      "s=Local SIP Lab example",
      "c=IN IP4 127.0.0.1",
      "t=0 0",
      "m=audio 40000 RTP/AVP 0",
      "a=rtpmap:0 PCMU/8000",
    ].join("\r\n");
    extraHeaders = ["Content-Type: application/sdp", `Content-Length: ${body.length}`];
  }

  const request = [
    `${method} ${uri} SIP/2.0`,
    ...baseHeaders,
    ...extraHeaders,
    "",
    body,
  ].join("\r\n");

  const responsesByMethod: Record<SipLabMethod, string[]> = {
    REGISTER: ["SIP/2.0 200 OK\r\nExpires: 3600\r\nContact: <sip:demo@client.invalid>\r\n\r\n(binding simulated locally)"],
    OPTIONS: ["SIP/2.0 200 OK\r\nAllow: INVITE, ACK, CANCEL, BYE, OPTIONS, REGISTER\r\nAccept: application/sdp\r\n\r\n(capabilities simulated locally)"],
    INVITE: [
      "SIP/2.0 100 Trying\r\n\r\n(simulated)",
      "SIP/2.0 180 Ringing\r\n\r\n(simulated)",
      "SIP/2.0 200 OK\r\nContent-Type: application/sdp\r\n\r\n(answer omitted; no media session created)",
    ],
    BYE: ["SIP/2.0 200 OK\r\n\r\n(dialog termination simulated locally)"],
  };

  return {
    method,
    request,
    responses: responsesByMethod[method],
    detail: `${method} example generated locally · no packet sent`,
  };
}
