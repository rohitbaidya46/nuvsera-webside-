/* eslint-disable no-console */
// Runs an application backup from the command line (e.g. host cron): npm run backup
// Load .env when run from the command line (existing environment variables take precedence).
try {
  process.loadEnvFile();
} catch {
  /* no .env file — rely on the environment */
}
import { createBackup } from "../src/lib/backup";
createBackup("cron").then((b) => { console.log(b.status, b.key, b.size); process.exit(b.status === "SUCCESS" ? 0 : 1); });
