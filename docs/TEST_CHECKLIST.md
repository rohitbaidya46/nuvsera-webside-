# Pre-launch Test Checklist

Run through this list on **staging** and again on **production** after go-live. Record the tester, date and result.

## A. Automated smoke test

Runs about 55 checks against a running instance: every public page, form validation, file-signature checks, honeypot, CSRF, 2FA login, role restrictions, content CRUD, CSV/Excel export, lockout and logout.

```bash
BASE_URL=https://staging.nuvseratechnology.com ADMIN_EMAIL=… ADMIN_PASSWORD=… ADMIN_TOTP_SECRET=… npm run test:smoke
```

- [ ] All checks pass. *(Leads it creates are named "[SMOKE] …" — delete them afterwards. It also creates a "[SMOKE] Editor" user: deactivate it.)*
- Note: with hCaptcha enabled, the public form checks fail with "Please complete the captcha". Run the automated test on a staging instance without `HCAPTCHA_SECRET`, and test the captcha manually (C4).

## B. Forms & emails

| # | Test | Expected | ✓ |
|---|---|---|---|
| B1 | Submit the **Contact** form with all fields and a PDF under 10 MB | Redirects to `/thank-you`; lead in Admin → Leads with the attachment | ☐ |
| B2 | Same, with a `.docx` file | Accepted | ☐ |
| B3 | Attach a 12 MB PDF | Rejected with a clear message | ☐ |
| B4 | Rename a `.jpg` to `.pdf` and attach it | Rejected ("does not look like a valid PDF") | ☐ |
| B5 | Submit with a missing name, an invalid email or no consent | Inline errors, screen reader announces them, nothing saved | ☐ |
| B6 | Complete the **Get a Quote** wizard (all 4 steps, Back/Continue, keyboard only) | Lead saved as "Quote wizard" with project type, platforms and preferred contact | ☐ |
| B7 | Admin notification email received by every recipient in Settings | Branded email with a link to the lead | ☐ |
| B8 | Visitor thank-you email received; check Gmail, Outlook and mobile rendering | Branded, correct details, not in spam (SPF/DKIM/DMARC pass) | ☐ |
| B9 | **Careers** application with a CV (from the job page and as a general application) | Application listed; CV downloads; both emails received | ☐ |
| B10 | **Newsletter**: subscribe, confirm by email, then unsubscribe via the export link | Status goes Pending → Active → Unsubscribed | ☐ |
| B11 | Visit `/?utm_source=linkedin&utm_medium=cpc&utm_campaign=test&li_fat_id=abc`, browse, then submit | Lead shows channel `linkedin-ads`, the UTM values and the landing page | ☐ |
| B12 | Visit with `?gclid=test`, then submit | Channel `google-ads` | ☐ |
| B13 | Reply to a lead from the admin panel | Visitor receives it; it appears under "Emails sent"; status becomes Contacted | ☐ |
| B14 | Set a reminder 5 minutes ahead | Reminder email arrives (cron); shows on the dashboard | ☐ |
| B15 | Settings → **Send test email** | Arrives | ☐ |

## C. Spam protection & security

| # | Test | Expected | ✓ |
|---|---|---|---|
| C1 | Submit 6 enquiries within 15 minutes from one IP | The 6th is rejected with "Too many requests" | ☐ |
| C2 | Check `https://securityheaders.com` | Grade A or better | ☐ |
| C3 | `http://` redirects to `https://`; HSTS header present | ✓ | ☐ |
| C4 | The captcha appears on the Contact, Quote and Careers forms; submitting without solving it fails | ✓ | ☐ |
| C5 | Enter `<script>alert(1)</script>` in every text field and in the rich-text editor | Shown as text or stripped — never executed | ☐ |
| C6 | Open `/api/admin/leads/export` in a private window | 401 | ☐ |
| C7 | Check `/media/../.env` and `/api/admin/applications/<id>/cv` while logged out | 404 / 401 | ☐ |
| C8 | Run an OWASP ZAP baseline scan against staging | No High findings | ☐ |
| C9 | Confirm no secrets are in the repository (`git log -p \| grep -i secret`) and `.env` is not committed | ✓ | ☐ |

## D. Admin access & roles

| # | Test | Expected | ✓ |
|---|---|---|---|
| D1 | First login requires 2FA set-up and recovery codes | ✓ | ☐ |
| D2 | 5 wrong passwords | Locked for 15 minutes; email received; audit entry | ☐ |
| D3 | Forgot password → reset link → new password; the old link no longer works | ✓ | ☐ |
| D4 | Set a user's `passwordChangedAt` to more than 90 days ago (DB) and log in | Forced to change password | ☐ |
| D5 | **Sales** user: sees Dashboard / Leads / Newsletter only; opening `/admin/content/services` redirects with a "no permission" notice | ✓ | ☐ |
| D6 | **Content Editor**: no Leads, Settings or Users; can edit a service and publish a blog post | ✓ | ☐ |
| D7 | **Admin**: no Users or Backups | ✓ | ☐ |
| D8 | Deactivate a user while they are logged in | Their next request returns them to login | ☐ |
| D9 | Every change above appears in the **Audit log** | ✓ | ☐ |
| D10 | Schedule a blog post 5 minutes ahead | Appears on `/blog` and in `sitemap.xml` after that time | ☐ |
| D11 | Upload a 5 MB JPG to the media library | Stored as WebP, much smaller; alt text saved | ☐ |
| D12 | Enter a statistic in Settings | The home-page statistics section appears; remove it → hidden | ☐ |
| D13 | Approve a testimonial without "permission on file" | NOT shown; tick both → shown | ☐ |
| D14 | Backups → Run backup now → download → `npm run backup:decrypt` | Valid JSON | ☐ |

## E. Cookie consent & tracking (DPDP)

| # | Test | Expected | ✓ |
|---|---|---|---|
| E1 | First visit | Banner shows; DevTools → Network shows **no** requests to googletagmanager / licdn | ☐ |
| E2 | Reject all | Still no tracking requests; the banner does not return | ☐ |
| E3 | Footer → Cookie settings → enable Analytics only | GA4 loads; LinkedIn doesn't | ☐ |
| E4 | Accept all, then submit a form | On `/thank-you`: GA4 `generate_lead`, the Google Ads conversion and the LinkedIn conversion fire (use Tag Assistant / LinkedIn Insight Tag helper) | ☐ |
| E5 | Refresh the thank-you page | Conversion does **not** fire again | ☐ |
| E6 | Withdraw consent (untick all) | Page reloads; trackers no longer load | ☐ |

## F. Responsive, accessibility & visual

| # | Test | Expected | ✓ |
|---|---|---|---|
| F1 | iPhone SE (375 px), a 390 px phone, iPad, 1366 px and 1920 px — every page | No horizontal scroll, no overlap, readable text | ☐ |
| F2 | Mobile bottom bar: **Call** opens the dialler, **WhatsApp** opens a chat with a pre-filled message, **Get a Quote** works | ✓ | ☐ |
| F3 | Keyboard only: skip link, menus (Esc closes), forms, quote wizard, FAQ accordions, cookie banner | Everything reachable, with visible focus | ☐ |
| F4 | Screen reader (NVDA / VoiceOver) on Home, Contact and the Quote wizard | Headings, labels and errors announced | ☐ |
| F5 | Dark mode toggle, and the OS dark preference | All pages legible | ☐ |
| F6 | `prefers-reduced-motion` on | No scroll animations; rotating headline static | ☐ |
| F7 | axe DevTools on 5 key pages | 0 serious or critical issues | ☐ |
| F8 | Latest Chrome, Safari (iOS + macOS), Firefox and Edge | ✓ | ☐ |

## G. Performance & SEO

| # | Test | Expected | ✓ |
|---|---|---|---|
| G1 | Lighthouse (mobile and desktop) on Home, a Service page, Contact, Blog post | **Performance, Accessibility, Best Practices, SEO ≥ 90** | ☐ |
| G2 | `https://nuvseratechnology.com/sitemap.xml` lists all published pages | ✓ | ☐ |
| G3 | `robots.txt` allows indexing in production only (`SITE_INDEXABLE=true`); staging disallows everything | ✓ | ☐ |
| G4 | Google Rich Results Test on Home (Organization, LocalBusiness), a service (FAQPage, Breadcrumb), a job (JobPosting) | Valid | ☐ |
| G5 | Share a page link on LinkedIn / WhatsApp | Correct title, description and image | ☐ |
| G6 | Submit the sitemap in Google Search Console (company account) | ✓ | ☐ |
| G7 | `/some-missing-page` | Branded 404 page with HTTP status 404 | ☐ |

## H. Content sign-off

- [ ] All `[PLACEHOLDER]` text replaced or kept unpublished (team, case studies, draft post, sample job, Grievance Officer, NS Exchange regulatory status, CERT-In status FAQ)
- [ ] Legal pages reviewed by counsel
- [ ] Company details (CIN, GSTIN, Udyam, address, phone, email) verified in the footer, Contact and About pages
- [ ] No invented testimonials, client logos, awards or statistics anywhere

### Results recorded during development (local, production build)

| Check | Result |
|---|---|
| `npm run test:smoke` | 55 / 55 passed |
| Lighthouse Home (mobile) | Perf 96 · A11y 100 · BP 100 · SEO 100 |
| Lighthouse Service page (mobile) | Perf 98 · A11y 100 · BP 100 · SEO 100 |
| Lighthouse Contact (mobile) | Perf 93 · A11y 100 · BP 100 · SEO 100 |
| Lighthouse desktop (all three) | 100 / 100 / 100 / 100 |

*Re-run these on the production infrastructure; the numbers depend on hosting and network conditions.*
