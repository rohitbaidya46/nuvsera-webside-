// Creates a local .env for development with freshly generated secrets.
// Works on Windows, macOS and Linux:  npm run setup
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";

if (existsSync(".env")) {
  console.log("✔ .env already exists — leaving it unchanged. Delete it first if you want to regenerate it.");
  process.exit(0);
}

const rl = createInterface({ input: process.stdin });
const lines = rl[Symbol.asyncIterator]();
const ask = async (q, def) => {
  process.stdout.write(`${q}${def ? ` [${def}]` : ""}: `);
  const { value, done } = await lines.next();
  if (!process.stdin.isTTY) process.stdout.write("\n");
  return (done ? "" : value).trim() || def;
};

console.log("\nNuvsera local setup — press Enter to accept the value in [brackets].\n");
const user = await ask("PostgreSQL username", "postgres");
const pass = await ask("PostgreSQL password (the one you chose when installing PostgreSQL)", "postgres");
const host = await ask("PostgreSQL host", "localhost");
const port = await ask("PostgreSQL port", "5432");
const adminEmail = await ask("Email for the first admin login", "admin@nuvseratechnology.com");
rl.close();

const values = {
  DATABASE_URL: `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/nuvsera`,
  APP_URL: "http://localhost:3000",
  APP_SECRET: randomBytes(48).toString("base64url"),
  ENCRYPTION_KEY: randomBytes(32).toString("hex"),
  CRON_SECRET: randomBytes(24).toString("hex"),
  SITE_INDEXABLE: "false",
  STORAGE_DRIVER: "local",
  UPLOAD_DIR: "./uploads",
  SEED_ADMIN_EMAIL: adminEmail,
};

let env = readFileSync(".env.example", "utf8");
for (const [k, v] of Object.entries(values)) {
  env = env.replace(new RegExp(`^${k}=.*$`, "m"), `${k}="${v}"`);
}
writeFileSync(".env", env);
console.log("\n✔ Created .env with new random secrets.");
console.log("  Keep this file private. Next: npm run db:migrate  →  npm run db:seed  →  npm run dev\n");
