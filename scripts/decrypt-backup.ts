/* eslint-disable no-console */
// Usage: ENCRYPTION_KEY=... npm run backup:decrypt -- backup-....json.gz.enc  → writes backup-....json
import { readFileSync, writeFileSync } from "node:fs";
import { decryptBackup } from "../src/lib/backup";

const file = process.argv[2];
if (!file) {
  console.error("Usage: npm run backup:decrypt -- <file.json.gz.enc>");
  process.exit(1);
}
const out = file.replace(/\.json\.gz\.enc$/, "") + ".json";
writeFileSync(out, decryptBackup(readFileSync(file)));
console.log(`✔ Decrypted to ${out}`);
