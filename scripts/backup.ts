/* eslint-disable no-console */
// Runs an application backup from the command line (e.g. host cron): npm run backup
import { createBackup } from "../src/lib/backup";
createBackup("cron").then((b) => { console.log(b.status, b.key, b.size); process.exit(b.status === "SUCCESS" ? 0 : 1); });
