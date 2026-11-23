# Nuvsera Technology — Corporate Website & Admin Panel

Source code for **nuvseratechnology.com**, the website of **Nuvsera Technology Private Limited**
(CIN U62013WB2025PTC283873 · GSTIN 19AAKCN9781A1Z2 · Udyam UDYAM-WB-10-0197639), the parent company of NS Exchange.

It contains:

- **Public website**: Home, About, Services (overview + 8 detail pages), NS Exchange, Portfolio, Our Process, Careers (job list + application form), Insights/blog, Contact, a 4-step Get-a-Quote wizard, Privacy Policy, Terms & Conditions, Refund & Cancellation Policy, a thank-you page and a 404 page.
- **Lead capture**: a sticky "Get a Quote" button, WhatsApp and click-to-call buttons, a contact form with file upload, the quote wizard, a newsletter sign-up (double opt-in) and lead-source tracking (UTM parameters, gclid/gbraid/wbraid, li_fat_id, referrer, landing page). Every submission is saved, emailed to the team, and answered with an automatic thank-you email.
- **Admin panel** (`/admin`): 2FA, 4 roles, dashboard, leads CRM, a CMS for every content type, media library, per-page SEO, settings, users, audit log and backups.

| | |
|---|---|
| Framework | Next.js 15 (App Router, server components, SSR) + TypeScript + Tailwind CSS 4 |
| Database | PostgreSQL 14+ with Prisma ORM 6 |
| Auth | Custom session auth (bcrypt + DB-backed sessions + TOTP 2FA). See [Why not NextAuth?](#why-custom-auth-instead-of-nextauth) |
| Email | SMTP via Nodemailer. Works with Amazon SES, Brevo, Zoho or Google Workspace |
| Files | Local disk / Docker volume, or Amazon S3 |
| Spam | hCaptcha + honeypot + timing check + PostgreSQL rate limiting + server-side validation |

---

## 0. Run it on your own computer (Windows, macOS or Linux) — easiest path

1. Install **Node.js 22 LTS** from https://nodejs.org (accept the defaults).
2. Install **PostgreSQL 16** from https://www.postgresql.org/download/ (on Windows use the EDB installer). During installation, **choose a password for the `postgres` user and write it down**. Keep the port as 5432.
3. Unzip this project, open the folder, and open a terminal there (Windows: click the address bar of the folder window, type `cmd`, press Enter).
4. Run these commands one at a time:

   ```bash
   npm ci
   ```

   ```bash
   npm run setup
   ```

   (asks for the PostgreSQL password from step 2 and creates `.env` with new security keys)

   ```bash
   npm run db:migrate
   ```

   ```bash
   npm run db:seed
   ```

   (**copy the temporary admin password it prints** — it is shown only once)

   ```bash
   npm run dev
   ```

5. Keep that terminal open and visit **http://localhost:3000** (website) and **http://localhost:3000/admin** (admin panel). On first admin sign-in, scan the QR code with an authenticator app on your phone and choose a new password.

To stop the site press `Ctrl + C` in the terminal; to start it again later, run `npm run dev` in the same folder.

## 1. Quick start (local development)

Requirements: Node.js 20.12+ (22 LTS recommended) and PostgreSQL 14+.

```bash
npm ci
```

```bash
cp .env.example .env
```

Edit `.env` and set at least `DATABASE_URL`, `APP_URL=http://localhost:3000`, `APP_SECRET`, `ENCRYPTION_KEY` and `CRON_SECRET`.

```bash
npx prisma migrate deploy
```

```bash
npm run db:seed
```

The seed adds placeholder content and the first Super Admin. If `SEED_ADMIN_PASSWORD` is blank, it prints a temporary password once.

```bash
npm run dev
```

Open http://localhost:3000 and http://localhost:3000/admin. On first sign-in you must set up two-factor authentication (Google Authenticator, Microsoft Authenticator, Authy and similar apps work) and choose a new password.

In development, if SMTP isn't configured, emails are printed to the console. If hCaptcha keys aren't set, the captcha is skipped (a warning is logged in production).

### Useful scripts

| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Develop / build / serve |
| `npm run typecheck` | TypeScript check |
| `npm run db:migrate` | Apply migrations (`prisma migrate deploy`) |
| `npm run db:seed` | Seed placeholder content and the first admin (safe to re-run) |
| `npm run create-admin -- "Name" email@x.com SUPER_ADMIN` | Create a user and print a password-setup link |
| `npm run backup` | Run an encrypted application backup from the CLI |
| `npm run backup:decrypt -- file.json.gz.enc` | Decrypt a backup (needs `ENCRYPTION_KEY`) |
| `npm run test:smoke` | End-to-end smoke test against a running instance (see `docs/TEST_CHECKLIST.md`) |

---

## 2. Before you deploy (business set-up)

Register **every** account in the name of **Nuvsera Technology Private Limited**, using a company-controlled
email address such as `it@nuvseratechnology.com`, never a personal one. Turn on 2FA on each account and keep the credentials in a company password manager.

| Account | Notes |
|---|---|
| Domain registrar (nuvseratechnology.com) | Registrant organisation: Nuvsera Technology Private Limited. Turn on registrar lock. |
| Hosting: Vercel (Team) **or** AWS (Organisation) | Billing in the company name with the GSTIN on invoices. |
| Managed PostgreSQL | Neon, Supabase, Amazon RDS (ap-south-1 Mumbai) or similar. Turn on automated backups / point-in-time recovery. |
| Amazon SES or Brevo | Verify the domain and add SPF, DKIM and DMARC DNS records. |
| hCaptcha | Add the production domain. |
| Google Analytics 4, Google Ads, LinkedIn Campaign Manager | Company Google / LinkedIn business accounts. |
| Git repository (GitHub/GitLab organisation) | Owned by the company organisation, with branch protection on `main`. |
| Amazon S3 (if used) | Private bucket, Block Public Access ON, SSE enabled. |

Legal review: the Privacy Policy, Terms & Conditions (payment and delivery policy) and Refund Policy are professionally drafted starting points. **Have them reviewed by your legal counsel**, and replace the `[PLACEHOLDER]` items (Grievance Officer name, NS Exchange regulatory status, CERT-In empanelment) before launch.

---

## 3. Deploying to Vercel (code on GitHub, automatic deploys)

Every push to the `main` branch on GitHub redeploys the site automatically. No command line is needed.

1. **Database:** create a free PostgreSQL project at **neon.tech** (region: AWS Asia Pacific, Mumbai or Singapore). Copy the connection string; use the *direct* (not "pooled") one.
2. **Vercel:** sign in at **vercel.com** with GitHub → **Add New → Project** → import this repository. Leave the build settings at their defaults; the `vercel-build` script in `package.json` is picked up automatically.
3. Before clicking **Deploy**, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the Neon connection string |
   | `APP_SECRET` | a random string of 48+ characters |
   | `ENCRYPTION_KEY` | 64 hex characters (`openssl rand -hex 32`). **Back it up**: losing it makes 2FA enrolments and backups unreadable |
   | `CRON_SECRET` | a random string |
   | `SEED_ADMIN_EMAIL` | email address for the first admin login |
   | `SEED_ADMIN_PASSWORD` | a temporary password; you must change it at first login |

   Optional now, recommended before launch: `SITE_INDEXABLE=true` (Production only, once on the real domain), `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` + `HCAPTCHA_SECRET`, and SMTP details (or set SMTP later in Admin → Site settings).
4. Click **Deploy**. Each build automatically applies database migrations and seeds placeholder content plus the first admin (it never overwrites existing content).
5. Open `https://<project>.vercel.app/admin`, sign in, set up 2FA and change the password.
6. **Domain:** Project → **Settings → Domains** → add `nuvseratechnology.com` and `www.nuvseratechnology.com`, then add the DNS records Vercel shows at your domain registrar. HTTPS is issued automatically. Once the domain works, set `APP_URL=https://nuvseratechnology.com` and redeploy.

Notes:
- **Uploads** (CVs, attachments, images) are stored in the database on Vercel (`STORAGE_DRIVER=database`, the default there), so no extra storage account is needed. For high volumes, switch to S3 (`STORAGE_DRIVER=s3` + S3 variables).
- **Scheduled jobs** (`vercel.json`): encrypted backup daily at 02:30 IST, and follow-up reminder emails daily at 09:00 IST. The free Hobby plan allows only daily jobs; on Pro you can change reminders to every 15 minutes (`*/15 * * * *`).
- `APP_URL` defaults to the Vercel production address when not set.

## 4a. Deploying to your own VPS: one command (Ubuntu 22.04/24.04 or Debian 12)

Needs a VPS with at least 1 vCPU, 2 GB RAM and 20 GB disk. The installer adds swap automatically on small servers.

1. At your domain registrar, create **A records** pointing `@` and `www` to the VPS IP address.
2. Log in to the VPS as root (or a sudo user) and run:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/rohitbaidya46/Nuvsera-Technology-Private-Limited/main/deploy/install.sh -o install.sh && sudo bash install.sh
   ```

3. Answer two questions: your domain, and the admin email. About 10 minutes later the installer prints the website address, the admin address and a **temporary admin password**.

It installs Docker, the website, PostgreSQL, **Caddy** (automatic HTTPS certificates and renewal, www → main domain redirect), scheduled jobs, nightly database dumps in `/opt/nuvsera/backups`, and a firewall that allows only SSH, HTTP and HTTPS. All secrets are generated on the server and stored in `/opt/nuvsera/.env` (root-only).

- **Update** after new code is pushed to GitHub: `sudo bash /opt/nuvsera/deploy/update.sh`. It takes a database backup first.
- **Logs:** `cd /opt/nuvsera && sudo docker compose logs -f app`
- **Private repository:** pass a read-only GitHub token through `REPO_URL`; the installer explains how if the download fails.
- **Email and captcha:** set SMTP in Admin → Site settings. For hCaptcha, add the keys to `.env` and run `update.sh`.

## 4. Deploying to AWS (or any VM) with Docker (manual)

```bash
cp .env.example .env
```

Fill in `.env`, including `POSTGRES_PASSWORD`. Keep `STORAGE_DRIVER=local`: uploads go to the `uploads` volume.

```bash
docker compose --profile tools run --rm migrate
```

This creates the tables and seeds placeholder content and the first admin.

```bash
docker compose up -d --build
```

The stack has these services:
- `app`: the Next.js standalone server on `127.0.0.1:3000`, running as a non-root user
- `db`: PostgreSQL 16 (on AWS you may use RDS instead; point `DATABASE_URL` at it and remove `db`)
- `scheduler`: calls `/api/cron/reminders` every 15 minutes and `/api/cron/backup` daily
- `db-backup`: nightly `pg_dump` to `./backups`, kept for 14 days. Sync this folder to S3 or another off-site store.

Put a TLS reverse proxy in front. A minimal **Caddyfile** that also handles HTTPS certificates automatically:

```
nuvseratechnology.com, www.nuvseratechnology.com {
  reverse_proxy 127.0.0.1:3000
}
```

On AWS, a typical set-up is: EC2 or ECS Fargate in `ap-south-1`, RDS PostgreSQL (Multi-AZ, automated backups), an S3 bucket for uploads, SES for email, and an ALB with an ACM certificate.

### Updating

```bash
git pull
```

```bash
docker compose --profile tools run --rm migrate
```

```bash
docker compose up -d --build app
```

---

## 5. Restoring backups

There are two layers of backup:
1. **Database level** (recommended primary): RDS or Neon point-in-time recovery, or the nightly `pg_dump` files. Restore with:

   ```bash
   pg_restore -d "$DATABASE_URL" --clean --if-exists backups/nuvsera-YYYYMMDD-HHMM.dump
   ```

2. **Application level** (Admin → Backups): an encrypted JSON export of all tables, made daily. Download it, then decrypt with `npm run backup:decrypt -- file.json.gz.enc` (`ENCRYPTION_KEY` must be set). Use this for audits, for migrating, or for recovering individual records.

Also back up uploaded files: the S3 bucket (turn on versioning) or the `uploads` Docker volume.

---

## 6. Security overview

| Control | Where |
|---|---|
| HTTPS + HSTS (2 years, preload) | `src/middleware.ts` (production) |
| Strict nonce-based Content-Security-Policy, `frame-ancestors 'none'`, nosniff, Referrer-Policy, Permissions-Policy, COOP | `src/middleware.ts` |
| CSRF: SameSite=Lax cookies plus an Origin check on every state-changing `/api` request | `src/middleware.ts` |
| Passwords: bcrypt (cost 12), 12+ characters with complexity rules, forced change every 90 days, reuse of the current password blocked | `src/lib/auth.ts` |
| 2FA (TOTP, RFC 6238) required for every admin; secrets AES-256-GCM encrypted; 8 one-time recovery codes | `src/app/api/admin/auth/two-factor` |
| Account lock: 15 minutes after 5 failed password or 2FA attempts, with an email notification | `api/admin/auth/login` |
| Sessions: random 256-bit token, stored hashed, HttpOnly, `__Host-` prefix, 12 h absolute / 2 h idle, revocable | `src/lib/auth.ts` |
| Role and permission check at the top of **every** admin API and page (`requireApi` / `requireAdmin`) | `src/lib/permissions.ts` |
| Server-side validation (Zod) on every input; rich text sanitised with an allow-list; spreadsheet-formula injection neutralised in exports | `src/lib/validation.ts`, `src/lib/sanitize.ts`, `src/lib/admin/export.ts` |
| Uploads: extension **and** magic-byte check, 10 MB limit, private storage, downloads authenticated and audit-logged; images re-encoded to WebP (strips EXIF/GPS) | `src/lib/uploads.ts`, `api/admin/media` |
| Rate limiting (PostgreSQL-backed, works across instances) on forms, login, 2FA and password reset | `src/lib/rate-limit.ts` |
| No user enumeration (same response and timing for unknown accounts) | login and forgot-password routes |
| Audit log of logins, changes, exports and downloads | `src/lib/audit.ts` |
| Secrets only in environment variables; the SMTP password entered in the admin panel is encrypted at rest | `.env.example`, `src/lib/settings.ts` |
| Data minimisation: IP addresses stored only as keyed hashes on public submissions | `src/lib/crypto.ts` |

### Why custom auth instead of NextAuth?
The requirements call for password + TOTP 2FA, forced 90-day rotation, lockout and server-side session revocation. NextAuth's Credentials provider supports none of these out of the box, and it discourages database sessions with credentials. A small, audited, database-session implementation (`src/lib/auth.ts`, ~150 lines) is easier to reason about and to review.

## 7. Privacy & DPDP Act 2023

- Cookie banner: **Accept all / Reject all / Settings**, with equal prominence. No analytics or ad tags load until consent is given (Google Consent Mode v2 defaults to denied). Users can withdraw consent at any time from "Cookie settings" in the footer.
- Each consent decision is recorded (an anonymous ID, the categories chosen, the policy version, a timestamp and a hashed IP) in `ConsentRecord`.
- Forms need explicit consent, and the consent time is stored with each lead. The newsletter uses double opt-in with one-click unsubscribe.
- The privacy policy covers purposes, Data Principal rights, the Grievance Officer, retention, and cross-border transfer.

## 8. Project structure

```
prisma/               schema.prisma, migrations, seed.ts, seed-data/ (original copy for services, pages, legal)
src/middleware.ts     CSP nonce, security headers, CSRF origin check, admin gate
src/app/(site)/       public pages
src/app/admin/        admin login/2FA pages and (panel)/ authenticated screens
src/app/api/          public form APIs, admin APIs, cron endpoints
src/components/site/  header, footer, forms, consent manager, sections
src/components/admin/ admin UI (generic content form, CRM, editor, media)
src/lib/              auth, permissions, settings, storage, email, validation, backup, etc.
src/lib/admin/resources.ts  declarative definitions of all CMS content types (add a field here → it appears in the admin)
docs/                 ADMIN_GUIDE.md, TEST_CHECKLIST.md
tests/smoke.ts        automated end-to-end smoke test
```

## 9. Known limitations / next steps

- **Bengali / Hindi language toggle** (optional in the brief) is **not implemented**. The structure supports adding `next-intl` with `/bn` and `/hi` routes later, but professionally translated copy is needed first.
- Placeholder content (team, case studies, a draft blog post, a job) is **unpublished** by default. Statistics and testimonials stay hidden until real data is entered and approved.
- Uploaded images are served through `/media/*` by the app itself. On high-traffic deployments, put a CDN (CloudFront or Vercel's edge cache) in front; responses are already `immutable`-cacheable.
