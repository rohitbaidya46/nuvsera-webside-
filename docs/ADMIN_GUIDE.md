# Nuvsera Admin Panel — User Guide

The admin panel lives at **https://nuvseratechnology.com/admin**. It is for authorised Nuvsera staff only, and every action is recorded in the audit log.

---

## 1. Signing in

1. Go to `/admin` and enter your email address and password.
2. **Two-factor authentication (2FA)** is required for everyone.
   - **First sign-in:** scan the QR code with an authenticator app (Google Authenticator, Microsoft Authenticator, Authy or 1Password), then enter the 6-digit code. You'll then see **8 recovery codes**. Save them in a password manager; each one works only once.
   - **Later sign-ins:** enter the current 6-digit code from the app.
3. If your account is new, or your password is older than **90 days**, you'll be asked to choose a new one. It must be at least 12 characters and include upper- and lowercase letters, a number and a symbol.

**Locked out?** After 5 wrong passwords or codes, the account locks for 15 minutes and you get an email. Wait, or use **Forgot your password?** on the sign-in page. The reset link is valid for 1 hour.

**Lost your phone?** Sign in with a recovery code. If you have none left, ask a Super Admin to **Reset 2FA** for you (Users & roles).

Sessions end after 2 hours of inactivity, or 12 hours at most. You can sign out other devices from **My account → Active sessions**.

---

## 2. Roles

| Role | Can access |
|---|---|
| **Super Admin** | Everything, including **Users & roles** and **Backups** |
| **Admin** | Dashboard, Leads, Newsletter, all Content, Media, Jobs, Applications, Site settings, Audit log |
| **Sales** | Dashboard, Leads (view, update, notes, reminders, email, export), Newsletter list |
| **Content Editor** | Content (pages, services, portfolio, blog, team, testimonials, FAQs), Media library, Jobs |

You only see the menu items your role allows. The server checks permissions on every action too, so hiding a menu item is not the only safeguard.

---

## 3. Dashboard

The dashboard shows:
- **Leads today / last 7 days / last 30 days**, and the **conversion rate**: the share of leads in the last 12 weeks marked *Won*
- **Leads per week**: hover over a bar for its numbers, or click *Show as table*
- **By service** and **By source** for the last 30 days
- **Follow-ups due** in the next 24 hours, and the **latest enquiries**
- **Website, last 30 days**: unique visitors (7 and 30 days), page views, **WhatsApp / call clicks**, and the **top pages**. These figures use no cookies: a visitor is counted once per day through a code that changes every day, and visitors with Do-Not-Track / Global Privacy Control are not counted, so treat them as a minimum.

Content Editors see a content overview instead.

---

## 4. Leads CRM

### Where leads come from
Every contact form and quote-wizard submission becomes a lead. Each lead records:
- **Channel**, worked out automatically:
  - `google-ads`: the visitor arrived with a gclid, gbraid or wbraid
  - `linkedin-ads`: li_fat_id
  - `paid:<source>` or `campaign:<source>`: UTM parameters
  - `organic-search`, `social`, `referral` or `direct`
- The **form page**, **landing page**, **referrer**, all five **UTM** values and the ad **click IDs**
- The visitor's **consent** and when it was given

When a lead arrives, the notification recipients (set in Site settings) get an email, and the visitor gets a thank-you email.

### Working a lead
1. **Leads** lists everything, newest first. Use the pipeline chips (**New → Contacted → Proposal Sent → Won / Lost**), the search box, and the service, source, owner and date filters.
2. Open a lead to:
   - change its **Status**. Every change is logged in *Activity*.
   - **Assign** it to a team member.
   - **Reply by email**. The email is branded and sent from the company address, with your address as reply-to, and is saved on the lead. Replying to a *New* lead moves it to *Contacted* automatically.
   - add **notes** (internal only).
   - set **follow-up reminders**. You get an email when one is due, and it appears on the dashboard.
   - download the **attachment** (the download is logged).
3. **Export**: the **CSV** and **Excel** buttons export whatever is currently filtered. Exports are logged in the audit log. Store exported files securely and delete them when you no longer need them.

> Personal data: only use lead details to answer that enquiry. To delete a lead (for example after an erasure request), an Admin opens it and clicks **Delete lead**.

---

### WhatsApp & call enquiries

**Leads → WhatsApp & call clicks** lists every click on a WhatsApp, call or email button: the time, the page and where the visitor came from (Google Ads, organic search, …). The conversation itself happens in WhatsApp or on the phone, so no name or number is recorded: once you have spoken to the person, add them as a lead. Export with **CSV**.

## 5. Content

Every content screen works the same way: a list with search, **New**, and an edit form with a **Save** button. Most items have **Published** and **Display order** settings, and an **SEO settings** panel.

| Section | Notes |
|---|---|
| **Pages & SEO** | Edit the heading, intro, body (About and legal pages) and SEO for every main page. Pages can't be created or deleted. Legal pages show their *Last updated* date automatically. |
| **Services** | The 8 service pages: one-line description, overview (rich text), deliverables (one per line), tech stack, process steps and FAQs. |
| **Portfolio** | Case studies. Untick **Placeholder content** once the case study is real. Publish only with the client's written permission and only verifiable results. |
| **Blog posts** | Rich-text editor, category, tags (comma-separated), cover image. Set **Status** to *Draft*, *Published*, or *Scheduled*. A scheduled post goes live automatically at its *Publish date*. |
| **Blog categories** | Name and URL slug. |
| **Team** | Name, designation, bio, photo, LinkedIn. Use real photos only, with consent. |
| **Testimonials** | Appear on the home page **only when both** *Approved* **and** *Written permission to publish is on file* are ticked. The home-page section is hidden while there are none. **Never** write, invent or edit testimonials. |
| **FAQs** | Choose where each appears: General, Our Process, NS Exchange or Careers. |
| **Jobs** | Fill in the details, tick **Published**, and optionally set a closing date. The job then appears on `/careers`, with job-posting markup for Google Jobs. |

### Rich-text editor
The toolbar has: bold, italic, headings (H2/H3), lists, quote, divider, link, image (from the media library), undo and redo. Pasted content is cleaned automatically when you save. Scripts and unsafe HTML are removed.

### SEO settings (every page, service, post, case study)
- **Meta title**: about 50–60 characters. **Meta description**: about 140–160 characters.
- **Open Graph image**: 1200 × 630 px, used when the page is shared on LinkedIn or WhatsApp.
- **Canonical URL**: leave blank unless the same content also lives at another address.
- **noindex**: hides the page from search engines and the sitemap.

`sitemap.xml` and `robots.txt` update automatically.

---

## 6. Media library

- Upload JPG, PNG, WebP, GIF or SVG images up to 8 MB. Each image is automatically **resized** (max 2000 px), **stripped of location metadata** and **compressed to WebP** (SVG logos are converted to a sharp WebP image, so no script inside an SVG can ever run).
- Upload **.glb 3D models** (up to 15 MB; keep them under 1.5 MB). Paste the copied URL into **Site settings → 3D models**. See `docs/3D_ASSETS.md` for the Tripo AI prompts and compression steps.
- Always add **alt text**: a short description of the image for people using screen readers. You can edit it on the card; it saves when you click away.
- **Copy URL** gives you a link to use in content. Images can also be picked directly from the editor and from image fields.

---

## 7. Careers → Applications

Lists applications with their position, status and CV. Change the status (*New → Reviewing → Shortlisted → Rejected / Hired*) from the dropdown. CVs are private: each download is logged, and you should not keep downloaded copies longer than needed. Applications are kept for up to 12 months (see the Privacy Policy).

## 8. Newsletter

Subscribers confirm by email (double opt-in). Export **Active** subscribers as CSV; the export includes each person's personal unsubscribe link, which you must include in every newsletter you send.

---

## 9. Site settings (Admin / Super Admin)

| Panel | What to set |
|---|---|
| Company & legal | Legal name, brand, **CIN, GSTIN, Udyam**. These appear in the footer. Optional logo. |
| Contact details | General email (shown everywhere), **support** and **projects/technical** emails, phone, **WhatsApp number** (digits with country code, e.g. `919734333355`), address, hours, map link |
| Social links | Shown in the footer only when filled in |
| Home page hero | Main headline (the last three words are set in gold italic), sub-headline. |
| 3D models | Optional .glb URL for each 3D slot (hero, software, blockchain, cybersecurity, NS Exchange). Blank = built-in model. |
| Company statistics | **Hidden on the website until at least one figure is entered.** Use only real, verifiable numbers. |
| Analytics & ad tracking | GA4 ID (`G-…`), Google Ads ID (`AW-…`) and lead conversion label, LinkedIn partner ID and conversion ID. These load only for visitors who consent to cookies. |
| Email delivery (SMTP) | Notification recipients, from name and address, and SMTP details (Amazon SES / Brevo). The password is encrypted and never shown again. Save first, then click **Send test email to me**. |

Conversions are tracked on the **thank-you page** after a successful form submission. In Google Ads, create a conversion action of type *Website → Submit lead form* and paste its label here.

---

## 10. Users & roles (Super Admin)

- **Invite a user**: enter their name, email and role. They receive a link (valid 48 h) to set their password, then they set up 2FA. If email isn't configured yet, the link is shown on screen; share it securely.
- Per user: change **Role**, **Unlock**, **Reset 2FA**, **Force password change**, **Sign out** (all sessions) and **Deactivate**. There must always be at least one active Super Admin, and you cannot demote or deactivate yourself.
- Deactivate staff on their last working day.

## 11. Audit log

Shows sign-ins (successful and failed), lockouts, every create, update and delete (with what changed), exports, file downloads and settings changes, along with who did it, when, and from which IP. Entries can't be edited or deleted.

## 12. Backups (Super Admin)

- An **encrypted backup** of all data runs automatically every night (02:30 IST) and is kept for 30 days. **Run backup now** makes one immediately, for example before a large change.
- Downloaded files are encrypted; decrypting them needs the server's `ENCRYPTION_KEY` (see README §5). Database-level backups (RDS / pg_dump) also run on the hosting side.

---

## 13. Good practice checklist

- [ ] Never share accounts. Each person has their own login.
- [ ] Keep your recovery codes in a password manager, not in email.
- [ ] Reply to new leads within one business day, and keep each lead's status up to date.
- [ ] Publish only real testimonials, case studies, client logos and statistics, with written permission.
- [ ] Review the audit log weekly (Admin).
- [ ] Remove access for leavers on the same day.
- [ ] Review the legal pages whenever services, pricing or data practices change.
