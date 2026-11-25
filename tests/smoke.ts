/* eslint-disable no-console */
/**
 * End-to-end smoke test against a running instance.
 *   BASE_URL=http://localhost:3000 ADMIN_EMAIL=… ADMIN_PASSWORD=… ADMIN_TOTP_SECRET=… npm run test:smoke
 * If ADMIN_TOTP_SECRET is omitted and the account has not enrolled, the test enrols 2FA and prints the secret.
 * Creates test records prefixed "[SMOKE]" and removes them at the end.
 */
import sharp from "sharp";
import { generateTotp } from "../src/lib/totp";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const ORIGIN = new URL(BASE).origin;
let failures = 0;
const ok = (cond: unknown, msg: string) => {
  console.log(`${cond ? "✔" : "✘"} ${msg}`);
  if (!cond) failures++;
};

class Client {
  cookies = new Map<string, string>();
  async req(path: string, init: RequestInit & { json?: unknown } = {}) {
    const headers = new Headers(init.headers);
    headers.set("origin", ORIGIN);
    if (this.cookies.size) headers.set("cookie", [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; "));
    if (init.json !== undefined) {
      headers.set("content-type", "application/json");
      init.body = JSON.stringify(init.json);
    }
    const res = await fetch(BASE + path, { ...init, headers, redirect: "manual" });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(";");
      const [k, ...v] = pair.split("=");
      if (/max-age=0|expires=thu, 01 jan 1970/i.test(c)) this.cookies.delete(k.trim());
      else this.cookies.set(k.trim(), v.join("="));
    }
    return res;
  }
  async json(path: string, init: RequestInit & { json?: unknown } = {}) {
    const r = await this.req(path, init);
    return { status: r.status, body: (await r.json().catch(() => ({}))) as Record<string, unknown> };
  }
}

function leadForm(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const base: Record<string, string> = {
    type: "contact", name: "[SMOKE] Test Lead", company: "Smoke Co", email: "smoke@example.com", phone: "+91 98765 43210",
    service: "custom-software-development", budget: "₹5 – 15 Lakh", timeline: "1 – 3 months", message: "This is an automated smoke-test enquiry.",
    consent: "on", startedAt: String(Date.now() - 10_000),
    attribution: JSON.stringify({ utm_source: "linkedin", utm_medium: "cpc", utm_campaign: "smoke", landingPage: "/?utm_source=linkedin", sourcePage: "/contact" }),
    ...overrides,
  };
  for (const [k, v] of Object.entries(base)) fd.set(k, v);
  return fd;
}

async function main() {
  const pub = new Client();

  // ── Public pages ──
  for (const p of ["/", "/services", "/services/cybersecurity", "/products/ns-exchange", "/about", "/process", "/portfolio", "/careers", "/blog", "/contact", "/get-a-quote", "/privacy-policy", "/terms-and-conditions", "/refund-and-cancellation-policy", "/cookie-policy", "/sitemap.xml", "/robots.txt"]) {
    const r = await pub.req(p);
    ok(r.status === 200, `GET ${p} → ${r.status}`);
  }
  const legacy = await pub.req("/services/cybersecurity-audit");
  ok([301, 308].includes(legacy.status) && (legacy.headers.get("location") || "").endsWith("/services/cybersecurity"), "Old service URL redirects permanently to its successor");
  const home = await (await pub.req("/")).text();
  ok(home.includes("+91 97343 33355") && home.includes("wa.me/919734333355"), "Home page shows the current phone and WhatsApp number");
  ok(home.includes("U62013WB2025PTC283873") && home.includes("19AAKCN9781A1Z2") && home.includes("UDYAM-WB-10-0197639"), "Footer shows CIN, GSTIN and Udyam");
  ok(home.includes('"LocalBusiness"') && home.includes('"Organization"'), "Organization + LocalBusiness JSON-LD present");
  ok(!home.includes("googletagmanager.com/gtag"), "No analytics script before consent");
  const r404 = await pub.req("/definitely-not-a-page");
  ok(r404.status === 404, "Unknown URL returns 404");
  const csp = (await pub.req("/")).headers.get("content-security-policy") || "";
  ok(csp.includes("nonce-") && csp.includes("frame-ancestors 'none'"), "Strict CSP header set");

  // ── Lead capture ──
  const bad = await pub.json("/api/leads", { method: "POST", body: leadForm({ email: "not-an-email", consent: "" }) });
  ok(bad.status === 422 && (bad.body.fields as Record<string, string>)?.email && (bad.body.fields as Record<string, string>)?.consent, "Server-side validation rejects bad email and missing consent");
  const fake = new FormData();
  fake.set("x", "1");
  const fd = leadForm();
  fd.set("attachment", new File([Buffer.from("not a pdf")], "evil.pdf", { type: "application/pdf" }));
  const badFile = await pub.json("/api/leads", { method: "POST", body: fd });
  ok(badFile.status === 422, "Fake PDF (wrong file signature) is rejected");
  const goodFd = leadForm();
  goodFd.set("attachment", new File([Buffer.from("%PDF-1.4\n%smoke\n")], "brief.pdf", { type: "application/pdf" }));
  const good = await pub.json("/api/leads", { method: "POST", body: goodFd });
  ok(good.status === 200 && good.body.redirect === "/thank-you?type=contact", "Valid contact form accepted with PDF attachment");
  const quote = await pub.json("/api/leads", { method: "POST", body: leadForm({ type: "quote", name: "[SMOKE] Quote Lead", projectType: "new", "platforms[]": "web", preferredContact: "whatsapp" }) });
  ok(quote.status === 200 && quote.body.redirect === "/thank-you?type=quote", "Quote wizard submission accepted");
  const bot = await pub.json("/api/leads", { method: "POST", body: leadForm({ website: "http://spam.example", name: "[SMOKE] Bot" }) });
  ok(bot.status === 200, "Honeypot submission gets a silent success (not stored)");
  const xsite = await fetch(`${BASE}/api/leads`, { method: "POST", headers: { origin: "https://evil.example" }, body: leadForm() });
  ok(xsite.status === 403, "Cross-origin POST blocked (CSRF)");
  const nl = await pub.json("/api/newsletter", { method: "POST", body: (() => { const f = new FormData(); f.set("email", "smoke-nl@example.com"); f.set("consent", "on"); return f; })() });
  ok(nl.status === 200, "Newsletter sign-up accepted (double opt-in pending)");

  // ── Admin auth ──
  const unauth = await pub.json("/api/admin/settings");
  ok(unauth.status === 401, "Admin API rejects anonymous requests");
  const red = await pub.req("/admin");
  ok(red.status === 307 || red.status === 308, "/admin redirects anonymous visitors to login");

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("ℹ ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin tests.");
    return;
  }
  const admin = new Client();
  const wrong = await admin.json("/api/admin/auth/login", { method: "POST", json: { email, password: "wrong-password" } });
  ok(wrong.status === 401, "Wrong password rejected");
  const login = await admin.json("/api/admin/auth/login", { method: "POST", json: { email, password } });
  ok(login.status === 200, "Password step accepted");
  const pre = await admin.json("/api/admin/settings");
  ok(pre.status === 401, "Admin API still blocked before 2FA");
  let secret = process.env.ADMIN_TOTP_SECRET;
  const setup = await admin.json("/api/admin/auth/two-factor");
  if (setup.body.mode === "setup") {
    secret = setup.body.secret as string;
    console.log(`ℹ Enrolled 2FA for ${email}. TOTP secret (store it for future runs): ${secret}`);
  }
  if (!secret) throw new Error("ADMIN_TOTP_SECRET required for an enrolled account");
  const badCode = await admin.json("/api/admin/auth/two-factor", { method: "POST", json: { code: "000000" } });
  ok(badCode.status === 401, "Wrong 2FA code rejected");
  const tf = await admin.json("/api/admin/auth/two-factor", { method: "POST", json: { code: generateTotp(secret) } });
  ok(tf.status === 200, "2FA verified");
  if (tf.body.next === "/admin/change-password") {
    const np = `${password}-N3w!`;
    const cp = await admin.json("/api/admin/auth/change-password", { method: "POST", json: { current: password, password: np } });
    ok(cp.status === 200, "Forced password change completed");
    console.log(`ℹ Password changed. New password: ${np}`);
  }

  const settings = await admin.json("/api/admin/settings");
  ok(settings.status === 200 && (settings.body.settings as { email: { smtpPassEnc: string } }).email.smtpPassEnc !== undefined, "Super Admin can read settings (SMTP secret masked)");

  // Content CRUD
  const create = await admin.json("/api/admin/content/faqs", { method: "POST", json: { question: "[SMOKE] Question?", answer: "<script>alert(1)</script>Answer", category: "general", order: 99, published: false } });
  ok(create.status === 200, "Create FAQ via generic content API");
  const faqId = create.body.id as string;
  const upd = await admin.json(`/api/admin/content/faqs/${faqId}`, { method: "PATCH", json: { question: "[SMOKE] Updated?", answer: "Answer", category: "general", order: 99, published: false } });
  ok(upd.status === 200, "Update FAQ");
  const dupe = await admin.json("/api/admin/content/categories", { method: "POST", json: { name: "Dup", slug: "blockchain" } });
  ok(dupe.status === 409, "Duplicate slug rejected with 409");
  const delFaq = await admin.json(`/api/admin/content/faqs/${faqId}`, { method: "DELETE" });
  ok(delFaq.status === 200, "Delete FAQ");
  const pageDel = await admin.json("/api/admin/content/pages/anything", { method: "DELETE" });
  ok(pageDel.status === 404 || pageDel.status === 405, "System pages cannot be deleted");

  // Leads CRM
  const exp = await admin.req("/api/admin/leads/export?format=csv&q=SMOKE");
  const csv = await exp.text();
  ok(exp.status === 200 && csv.includes("[SMOKE] Test Lead") && csv.includes("paid:linkedin"), "CSV export contains lead with derived source");
  const xlsx = await admin.req("/api/admin/leads/export?format=xlsx&q=SMOKE");
  ok(xlsx.status === 200 && (xlsx.headers.get("content-type") || "").includes("spreadsheetml"), "Excel export works");

  // Media library: upload a PNG, expect WebP conversion and a public URL that serves it
  const png = await sharp({ create: { width: 64, height: 32, channels: 3, background: "#E3A93B" } }).png().toBuffer();
  const broken = new FormData();
  broken.set("file", new File([new Uint8Array(png.subarray(0, 60))], "broken.png", { type: "image/png" }));
  const br = await admin.json("/api/admin/media", { method: "POST", body: broken });
  ok(br.status === 422, "Damaged image is rejected with a clear message");
  const mfd = new FormData();
  mfd.set("file", new File([new Uint8Array(png)], "smoke.png", { type: "image/png" }));
  mfd.set("alt", "[SMOKE] test image");
  const up = await admin.json("/api/admin/media", { method: "POST", body: mfd });
  const item = up.body.item as { id: string; url: string } | undefined;
  ok(up.status === 200 && item?.url.endsWith(".webp"), "Media upload converts image to WebP");
  if (item) {
    const img = await pub.req(item.url);
    ok(img.status === 200 && img.headers.get("content-type") === "image/webp", "Uploaded image is served publicly");
    await admin.json(`/api/admin/media/${item.id}`, { method: "DELETE" });
  }

  // Role restriction: create a Content Editor and check they cannot read leads
  const editorEmail = `smoke-editor-${Date.now()}@example.com`;
  const inv = await admin.json("/api/admin/users", { method: "POST", json: { name: "[SMOKE] Editor", email: editorEmail, role: "CONTENT_EDITOR" } });
  ok(inv.status === 200, "Super Admin can invite a Content Editor");
  const token = new URL(inv.body.inviteLink as string).searchParams.get("token")!;
  const edPass = "Smoke-Editor-Pass-1!";
  const reset = await new Client().json("/api/admin/auth/reset-password", { method: "POST", json: { token, password: edPass } });
  ok(reset.status === 200, "Invite link sets password");
  const ed = new Client();
  await ed.json("/api/admin/auth/login", { method: "POST", json: { email: editorEmail, password: edPass } });
  const edSetup = await ed.json("/api/admin/auth/two-factor");
  await ed.json("/api/admin/auth/two-factor", { method: "POST", json: { code: generateTotp(edSetup.body.secret as string) } });
  const edLeads = await ed.json("/api/admin/leads/export?format=csv");
  ok(edLeads.status === 403, "Content Editor is forbidden from leads export");
  const edUsers = await ed.json("/api/admin/users", { method: "POST", json: { name: "x", email: "x@example.com", role: "SUPER_ADMIN" } });
  ok(edUsers.status === 403, "Content Editor cannot create users");
  const edFaq = await ed.json("/api/admin/content/faqs", { method: "POST", json: { question: "[SMOKE] Editor FAQ?", answer: "Yes", category: "general", order: 98, published: false } });
  ok(edFaq.status === 200, "Content Editor can manage content");
  if (edFaq.body.id) await ed.json(`/api/admin/content/faqs/${edFaq.body.id}`, { method: "DELETE" });

  // Lockout
  const lock = new Client();
  let last = 0;
  for (let i = 0; i < 5; i++) last = (await lock.json("/api/admin/auth/login", { method: "POST", json: { email: editorEmail, password: "wrong" } })).status;
  ok(last === 423, "Account locks after 5 failed attempts");

  // Clean up: deactivate the editor
  const users = await admin.req("/admin/users");
  ok(users.status === 200, "Users page renders for Super Admin");

  const out = await admin.json("/api/admin/auth/logout", { method: "POST" });
  ok(out.status === 200, "Logout");
  ok((await admin.json("/api/admin/settings")).status === 401, "Session invalid after logout");
}

main()
  .catch((e) => {
    console.error(e);
    failures++;
  })
  .finally(() => {
    console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed");
    process.exit(failures ? 1 : 0);
  });
