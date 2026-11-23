/** Centralised, typed access to environment variables. Secrets never live in code. */
function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  get appUrl() {
    return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  },
  get appSecret() {
    const v = required("APP_SECRET");
    if (process.env.NODE_ENV === "production" && v.length < 32) throw new Error("APP_SECRET must be at least 32 characters");
    return v;
  },
  get encryptionKey() {
    const v = required("ENCRYPTION_KEY");
    if (!/^[0-9a-fA-F]{64}$/.test(v)) throw new Error("ENCRYPTION_KEY must be 64 hex characters (32 bytes)");
    return Buffer.from(v, "hex");
  },
  get cronSecret() {
    return process.env.CRON_SECRET || "";
  },
  get isProd() {
    return process.env.NODE_ENV === "production";
  },
  hcaptchaSiteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "",
  get hcaptchaSecret() {
    return process.env.HCAPTCHA_SECRET || "";
  },
  get storageDriver(): "local" | "s3" {
    return process.env.STORAGE_DRIVER === "s3" ? "s3" : "local";
  },
};
