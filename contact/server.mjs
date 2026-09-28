// The contact form's only backend: POST /api/contact -> one email to us.
//
// Runs as its own small container next to the static site; nginx proxies
// /api/contact here (deploy/dokploy/nginx.conf). No dependencies beyond
// Node 22. It never emails the address someone typed in (that would make it
// a relay for spam); the visitor is only the Reply-To.
//
// Environment:
//   BREVO_API_KEY    required to send; without it every submission gets 503
//   CONTACT_TO       inbox that receives submissions
//   CONTACT_FROM     sender, on a domain verified in Brevo
//   CONTACT_ORIGINS  comma-separated Origin values allowed to post
//   PORT             default 3000
import http from "node:http";
import { pathToFileURL } from "node:url";
import { packageById } from "../src/pricing/packages.mjs";

const LIMITS = {
  body: 16 * 1024,
  name: 100,
  email: 200,
  company: 150,
  message: { min: 10, max: 5000 },
  // A person takes longer than this to read and fill four fields.
  minElapsedMs: 3000,
  perIp: { count: 5, windowMs: 10 * 60 * 1000 },
  global: { count: 60, windowMs: 60 * 60 * 1000 }
};

const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i;

export function configFromEnv(env = process.env) {
  return {
    apiKey: env.BREVO_API_KEY ?? "",
    brevoUrl: env.BREVO_URL ?? "https://api.brevo.com/v3/smtp/email",
    to: env.CONTACT_TO ?? "tihomir.jauk@lumiverse.hr",
    from: env.CONTACT_FROM ?? "web@lumiverse.hr",
    origins: (env.CONTACT_ORIGINS ?? "https://www.lumiverse.hr").split(",").map((s) => s.trim()).filter(Boolean)
  };
}

// Counts requests per key in a sliding window; forgets keys once idle.
function limiter({ count, windowMs }) {
  const hits = new Map();
  return (key, now = Date.now()) => {
    const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
    if (recent.length >= count) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 10_000) for (const [k, v] of hits) if (!v.some((at) => now - at < windowMs)) hits.delete(k);
    return true;
  };
}

const oneLine = (value) => String(value).replace(/[\r\n\t]+/g, " ").trim();

// Returns the cleaned submission, or the name of the first bad field.
export function validate(input) {
  const text = (key) => (typeof input[key] === "string" ? input[key].trim() : "");
  const out = {
    name: oneLine(text("name")),
    email: text("email"),
    company: oneLine(text("company")),
    package: text("package"),
    message: text("message").replace(/\r\n?/g, "\n"),
    lang: text("lang") === "hr" ? "hr" : "en"
  };
  if (!out.name || out.name.length > LIMITS.name) return { field: "name" };
  if (out.email.length > LIMITS.email || !EMAIL.test(out.email)) return { field: "email" };
  if (out.company.length > LIMITS.company) return { field: "company" };
  if (out.package && out.package !== "other" && !packageById.has(out.package)) return { field: "package" };
  if (out.message.length < LIMITS.message.min || out.message.length > LIMITS.message.max) return { field: "message" };
  return { value: out };
}

function packageName(id) {
  if (!id) return "Not sure yet";
  if (id === "other") return "Something else";
  return packageById.get(id).en.name;
}

export function brevoPayload(sub, config) {
  const topic = packageName(sub.package);
  return {
    sender: { name: "lumiverse.hr", email: config.from },
    to: [{ email: config.to }],
    replyTo: { email: sub.email, name: sub.name },
    subject: `[lumiverse.hr] ${topic}: ${sub.name}`.slice(0, 200),
    textContent: [
      `Name:     ${sub.name}`,
      `Email:    ${sub.email}`,
      `Company:  ${sub.company || "-"}`,
      `Interest: ${topic}`,
      `Page:     ${sub.lang === "hr" ? "Croatian" : "English"}`,
      "",
      sub.message
    ].join("\n")
  };
}

function readBody(req, max) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > max) {
        reject(Object.assign(new Error("too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export function createContactServer(config = configFromEnv(), { fetchImpl = fetch, log = console.log } = {}) {
  const perIp = limiter(LIMITS.perIp);
  const global = limiter(LIMITS.global);

  return http.createServer(async (req, res) => {
    const reply = (status, body) => {
      res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      res.end(JSON.stringify(body));
    };
    const outcome = (what, extra = {}) => log(JSON.stringify({ at: new Date().toISOString(), outcome: what, ...extra }));

    const url = (req.url ?? "").split("?")[0];
    if (url === "/healthz" && req.method === "GET") return reply(200, { ok: true });
    if (url !== "/api/contact") return reply(404, { error: "not_found" });
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return reply(405, { error: "method" });
    }
    if (!config.origins.includes(req.headers.origin ?? "")) {
      outcome("bad_origin");
      return reply(403, { error: "origin" });
    }
    if (!(req.headers["content-type"] ?? "").startsWith("application/json")) {
      return reply(415, { error: "content_type" });
    }

    // Traefik sets X-Real-Ip to the client address and nginx passes it on.
    const ip = String(req.headers["x-real-ip"] ?? req.socket.remoteAddress ?? "unknown");
    if (!perIp(ip) || !global("all")) {
      outcome("rate_limited");
      return reply(429, { error: "rate_limited" });
    }

    let input;
    try {
      input = JSON.parse(await readBody(req, LIMITS.body));
    } catch (error) {
      return reply(error.status ?? 400, { error: error.status === 413 ? "too_large" : "json" });
    }
    if (!input || typeof input !== "object") return reply(400, { error: "json" });

    // Bots: a filled hidden field, or a form submitted faster than anyone
    // could type. Answered like a success so they learn nothing.
    const elapsed = Number(input.elapsed);
    if (input.website || !Number.isFinite(elapsed) || elapsed < LIMITS.minElapsedMs) {
      outcome("dropped");
      return reply(200, { ok: true });
    }

    const { value, field } = validate(input);
    if (!value) return reply(400, { error: "invalid", field });

    if (!config.apiKey) {
      outcome("not_configured");
      return reply(503, { error: "not_configured" });
    }

    try {
      const sent = await fetchImpl(config.brevoUrl, {
        method: "POST",
        headers: { "api-key": config.apiKey, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(brevoPayload(value, config)),
        signal: AbortSignal.timeout(10_000)
      });
      if (!sent.ok) {
        outcome("send_failed", { status: sent.status });
        return reply(502, { error: "send_failed" });
      }
    } catch (error) {
      outcome("send_failed", { error: error.name });
      return reply(502, { error: "send_failed" });
    }

    outcome("sent", { package: value.package || null });
    return reply(200, { ok: true });
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const config = configFromEnv();
  const port = Number(process.env.PORT ?? 3000);
  if (!config.apiKey) console.warn("BREVO_API_KEY is not set: submissions will get 503 until it is.");
  createContactServer(config).listen(port, () => console.log(`contact: listening on :${port}`));
}
