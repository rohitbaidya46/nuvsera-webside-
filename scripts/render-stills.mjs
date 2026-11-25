/**
 * Renders the static fallback images used when 3D is off (reduced motion, Save-Data, no WebGL, low power)
 * and while 3D is loading: public/images/3d/<model>.webp.
 *
 * Usage (with the site running locally, e.g. `npm run dev`):
 *   node scripts/render-stills.mjs [http://localhost:3000]
 * Re-run after changing a built-in model or uploading a custom GLB in Site settings.
 * Needs Playwright with Chromium (not a project dependency): `npm i -g playwright && npx playwright install chromium`.
 */
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const base = process.argv[2] || "http://localhost:3000";
const out = new URL("../public/images/3d/", import.meta.url);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
// Render at the "high" quality tier regardless of the machine running this script.
await page.addInitScript(() => {
  Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
  Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
  try { sessionStorage.setItem("nv_seen", "1"); } catch {}
});
await page.goto(base + "/?3d=high", { waitUntil: "networkidle" });
const reject = page.getByRole("button", { name: "Reject all" });
if (await reject.count()) await reject.first().click();

// Every ModelView renders a fallback <img src="/images/3d/<model>.webp">; find each one's box.
const models = await page.$$eval('img[src^="/images/3d/"]', (imgs) => [...new Set(imgs.map((i) => i.getAttribute("src").split("/").pop().replace(".webp", "")))]);
for (const model of models) {
  const img = page.locator(`img[src="/images/3d/${model}.webp"]`).first();
  await img.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.mouse.move(800, 500);
  await page.waitForTimeout(4000);
  // Hide everything but the WebGL layer so the capture is just the model on a transparent background.
  await page.addStyleTag({ content: "html,body{background:transparent!important} body *:not(canvas){visibility:hidden!important} canvas{visibility:visible!important} canvas[data-starfield]{display:none!important}" });
  await page.waitForTimeout(600);
  const box = await img.boundingBox();
  const png = await page.screenshot({ clip: box, omitBackground: true });
  await page.evaluate(() => document.querySelectorAll("style").forEach((s) => s.textContent.includes("visibility:hidden!important") && s.remove()));
  const file = new URL(`${model}.webp`, out);
  await sharp(png).trim({ threshold: 1 }).resize({ width: 900, height: 900, fit: "inside", withoutEnlargement: true }).extend({ top: 24, bottom: 24, left: 24, right: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 82, alphaQuality: 90 }).toFile(file.pathname);
  console.log("✔", model);
}
await browser.close();
