// npm run test:contact
//
// Runs the real server against a stand-in for Brevo, so every path is
// exercised down to the outgoing request without sending real email.
import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { createContactServer } from "./server.mjs";

const ORIGIN = "https://www.lumiverse.hr";
let sent = [];
let brevoStatus = 201;
const fakeFetch = async (url, init) => {
  sent.push({ url, headers: init.headers, body: JSON.parse(init.body) });
  return { ok: brevoStatus < 300, status: brevoStatus };
};

const config = {
  apiKey: "test-key",
  brevoUrl: "https://brevo.test/v3/smtp/email",
  to: "inbox@lumiverse.test",
  from: "web@lumiverse.test",
  origins: [ORIGIN]
};

const servers = [];
async function start(overrides = {}) {
  const server = createContactServer({ ...config, ...overrides }, { fetchImpl: fakeFetch, log: () => {} });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}

let base;
before(async () => {
  base = await start();
});
after(() => servers.forEach((server) => server.close()));
beforeEach(() => {
  sent = [];
  brevoStatus = 201;
});

let ipCounter = 0;
const good = () => ({
  name: "Ana Horvat",
  email: "ana@example.com",
  company: "Primjer d.o.o.",
  package: "ai-newsroom",
  message: "We run a regional portal and want to publish more local news.",
  lang: "hr",
  elapsed: 12000
});

function post(body, { origin = ORIGIN, type = "application/json", ip = `10.0.0.${++ipCounter}`, url = base } = {}) {
  const headers = { "Content-Type": type, "X-Real-Ip": ip };
  if (origin) headers.Origin = origin;
  return fetch(`${url}/api/contact`, {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body)
  });
}

test("a valid submission sends one email to our inbox, visitor as reply-to", async () => {
  const res = await post(good());
  assert.equal(res.status, 200);
  assert.equal(sent.length, 1);
  const [mail] = sent;
  assert.equal(mail.url, config.brevoUrl);
  assert.equal(mail.headers["api-key"], "test-key");
  assert.deepEqual(mail.body.to, [{ email: "inbox@lumiverse.test" }]);
  assert.deepEqual(mail.body.replyTo, { email: "ana@example.com", name: "Ana Horvat" });
  assert.equal(mail.body.sender.email, "web@lumiverse.test");
  assert.match(mail.body.subject, /AI Newsroom: Ana Horvat/);
  assert.match(mail.body.textContent, /regional portal/);
  assert.match(mail.body.textContent, /Page:\s+Croatian/);
});

test("the visitor's address is never a recipient", async () => {
  await post({ ...good(), email: "victim@example.com" });
  assert.ok(sent.every((mail) => mail.body.to.every((r) => r.email === config.to)));
});

test("newlines in the name cannot reach the subject line", async () => {
  await post({ ...good(), name: "Ana\r\nBcc: x@example.com" });
  assert.equal(sent.length, 1);
  assert.doesNotMatch(sent[0].body.subject, /[\r\n]/);
});

test("honeypot and too-fast submissions look accepted but send nothing", async () => {
  for (const body of [{ ...good(), website: "http://spam" }, { ...good(), elapsed: 800 }, { ...good(), elapsed: undefined }]) {
    const res = await post(body);
    assert.equal(res.status, 200);
  }
  assert.equal(sent.length, 0);
});

test("invalid fields are rejected with the field name", async () => {
  const cases = [
    [{ name: "" }, "name"],
    [{ email: "not-an-email" }, "email"],
    [{ package: "free-lunch" }, "package"],
    [{ message: "hi" }, "message"],
    [{ message: "x".repeat(5001) }, "message"]
  ];
  for (const [patch, field] of cases) {
    const res = await post({ ...good(), ...patch });
    assert.equal(res.status, 400, field);
    assert.equal((await res.json()).field, field);
  }
  assert.equal(sent.length, 0);
});

test("unknown package ids are rejected but 'other' and blank are fine", async () => {
  assert.equal((await post({ ...good(), package: "other" })).status, 200);
  assert.equal((await post({ ...good(), package: "" })).status, 200);
  assert.equal(sent.length, 2);
  assert.match(sent[0].body.subject, /Something else/);
  assert.match(sent[1].body.subject, /Not sure yet/);
});

test("a foreign or missing Origin is refused", async () => {
  assert.equal((await post(good(), { origin: "https://evil.example" })).status, 403);
  assert.equal((await post(good(), { origin: null })).status, 403);
  assert.equal(sent.length, 0);
});

test("only JSON POSTs to /api/contact are accepted", async () => {
  assert.equal((await post("name=a", { type: "application/x-www-form-urlencoded" })).status, 415);
  assert.equal((await post("{not json")).status, 400);
  assert.equal((await fetch(`${base}/api/contact`)).status, 405);
  assert.equal((await fetch(`${base}/elsewhere`, { method: "POST" })).status, 404);
  assert.equal((await fetch(`${base}/healthz`)).status, 200);
});

test("oversized bodies get 413", async () => {
  const res = await post({ ...good(), message: "x".repeat(20 * 1024) }).catch((error) => error);
  // The server may cut the connection mid-upload; either way nothing is sent.
  if (res instanceof Response) assert.equal(res.status, 413);
  assert.equal(sent.length, 0);
});

test("one address gets five tries per window", async () => {
  const statuses = [];
  for (let i = 0; i < 7; i++) statuses.push((await post(good(), { ip: "203.0.113.9" })).status);
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429, 429]);
});

test("without an API key the form fails loudly, not silently", async () => {
  const url = await start({ apiKey: "" });
  const res = await post(good(), { url });
  assert.equal(res.status, 503);
  assert.equal(sent.length, 0);
});

test("a Brevo error surfaces as 502", async () => {
  brevoStatus = 401;
  const res = await post(good());
  assert.equal(res.status, 502);
});
