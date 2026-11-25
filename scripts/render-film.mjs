/**
 * Renders the Nuvsera brand film to MP4 from the site's own 3D scenes, frame by frame with a controlled
 * clock, so the result is perfectly smooth even on machines without a GPU.
 *
 * Usage (site running locally with `npm run dev`, or `ENABLE_FILM_ROUTE=true npm start`):
 *   node scripts/render-film.mjs [landscape|vertical] [http://localhost:3000] [fps]
 * Output: brand/film/nuvsera-brand-film-<format>.mp4  (needs ffmpeg with libx264, and Playwright + Chromium:
 * `npm i -g playwright && npx playwright install chromium`).
 */
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const { chromium } = createRequire(import.meta.url)("playwright");

const format = process.argv[2] === "vertical" ? "vertical" : "landscape";
const base = process.argv[3] || "http://localhost:3000";
const fps = Number(process.argv[4] || 30);
const size = format === "vertical" ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 };
const outDir = new URL("../brand/film/", import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });
const frames = mkdtempSync(join(tmpdir(), "nv-film-"));

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
await page.goto(`${base}/film?render=1${format === "vertical" ? "&format=vertical" : ""}`, { waitUntil: "domcontentloaded" });
// Let the scene load, compile shaders and fonts settle (advance the fake clock while waiting).
for (let i = 0; i < 240; i++) {
  if (await page.evaluate(() => window.__filmReady === true && document.fonts.status === "loaded")) break;
  await page.clock.runFor(50);
  await page.waitForTimeout(100);
}
for (let i = 0; i < 20; i++) await page.clock.runFor(16);
const duration = await page.evaluate(() => window.__filmDuration);
await page.evaluate(() => window.__filmStart());

const total = Math.ceil(duration * fps);
const step = 1000 / fps;
for (let f = 0; f < total; f++) {
  await page.clock.runFor(step);
  await page.screenshot({ path: join(frames, `${String(f).padStart(5, "0")}.jpg`), type: "jpeg", quality: 92 });
  if (f % fps === 0) console.log(`frame ${f}/${total}`);
}
await browser.close();

const out = join(outDir, `nuvsera-brand-film-${format}.mp4`);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", join(frames, "%05d.jpg"), "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]);
rmSync(frames, { recursive: true, force: true });
console.log("✔", out);
