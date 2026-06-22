# Deploy — api-jeffhonforloco Worker

## One-time Cloudflare Dashboard setup

### 1. Create D1 database
Cloudflare Dashboard → Workers & Pages → D1 → Create database
- Name: `photography_db`
- Copy the **Database ID** shown after creation
- Paste it into `wrangler.toml` → `database_id = "..."`

### 2. Run the schema migration
After deploying the Worker (step 4), go to:
Cloudflare Dashboard → D1 → photography_db → Console
Paste and run the contents of `schema.sql`

### 3. Add secrets (Dashboard → Workers → api-jeffhonforloco → Settings → Variables)
| Secret | Value |
|---|---|
| `RESEND_API_KEY` | Your Resend API key |
| `ANTHROPIC_API_KEY` | Your Anthropic API key (main chat agent + negotiation) |
| `SIREIQ_HF_TOKEN` | Your Hugging Face token for SIREIQ easy chat jobs |
| `SIREIQ_HF_MODEL` | Optional model override, defaults to `openai/gpt-oss-20b:fastest` |
| `OPENAI_API_KEY` | Your OpenAI API key (for daily journal posts and config checks) |
| `JWT_SECRET` | Any long random string (32+ chars) |
| `ADMIN_EMAIL` | info@jeffhonforlocophotos.com |
| `ALLOWED_ORIGIN` | https://jeffhonforlocophotos.com |
| `PUBLIC_API_BASE_URL` | Worker API base URL, for example `https://api-jeffhonforloco-photography.YOUR_ACCOUNT.workers.dev/api/v1` |
| `BUSINESS_POSTAL_ADDRESS` | Business mailing address for automated email footers |

### 4. Deploy

Create a **Worker** project (not Pages) and connect it to GitHub with these settings:

| Field | Value |
|---|---|
| Root directory | *(leave empty)* |
| Build command | *(leave empty)* |
| Deploy command | `cd workers/api && npm ci && npx wrangler deploy` |

**Why**: wrangler 4.x auto-detects Vite when run from the repo root, causing a "Vite 5.x not supported" error. The `cd workers/api` prefix runs wrangler from the Worker subdirectory where there is no Vite config, so auto-detection is bypassed and it reads `wrangler.toml` correctly.

### 5. Create first admin account
After Worker is deployed, POST to:
```
POST https://api-jeffhonforloco.YOUR_ACCOUNT.workers.dev/api/v1/auth/setup
Content-Type: application/json

{"username": "jeff.admin", "email": "info@jeffhonforlocophotos.com", "password": "YourSecurePassword"}
```
This only works once (when the users table is empty).

### 6. Connect the frontend
Cloudflare Pages → your site → Settings → Environment Variables:
```
VITE_API_BASE_URL = https://api-jeffhonforloco.YOUR_ACCOUNT.workers.dev
```
Redeploy Pages after saving.

## API endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/v1/auth/setup | public (once) | Create first admin |
| POST | /api/v1/auth/login | public | Login → JWT tokens |
| POST | /api/v1/auth/refresh | public | Refresh access token |
| GET  | /api/v1/auth/me | required | Current user |
| POST | /api/v1/contacts | public | Submit contact/booking |
| GET  | /api/v1/contacts | required | List contacts |
| GET  | /api/v1/contacts/stats | required | Contact stats |
| POST | /api/v1/email/contact | public | Contact + email |
| POST | /api/v1/email/newsletter | public | Newsletter signup |
| GET  | /api/v1/email/unsubscribe | public | Unsubscribe from automated follow-up emails |
| POST | /api/v1/email/unsubscribe | public | JSON unsubscribe endpoint |
| GET  | /api/v1/blog | public | Blog posts list |
| GET  | /api/v1/blog/slug/:slug | public | Post by slug |
| POST | /api/v1/blog | required | Create post |
| GET  | /api/v1/portfolio | public | Portfolio images |
| GET  | /api/v1/portfolio/featured | public | Featured images |
| GET  | /api/v1/portfolio/categories | public | Category list |
| POST | /api/v1/portfolio | required | Add image |
| GET  | /api/v1/admin/dashboard | required | Dashboard stats |
| GET  | /api/v1/admin/analytics | required | Analytics |
| GET  | /api/v1/admin/email-templates | required | List automated email templates |
| POST | /api/v1/admin/email-templates | required | Create automated email template |
| PUT  | /api/v1/admin/email-templates/:id | required | Update automated email template |
| DELETE | /api/v1/admin/email-templates/:id | required | Delete automated email template |
| GET  | /api/v1/admin/email-sequences | required | List scheduled lead follow-up emails |
| POST | /api/v1/admin/email-sequences/process | required | Manually process due follow-up emails |
| GET  | /api/v1/admin/database/stats | required | Database table counts for admin |
| GET  | /api/v1/admin/health | required | D1 health check |
| POST | /api/v1/admin/database/backup | required | Prepare SQL export metadata |
| GET  | /api/v1/admin/export/:type | required | Export data |
| POST | /api/v1/analytics | public | Track event |
| GET  | /health | public | Health check |

## Lead follow-up automation

- New contact form leads and chat-captured leads create four scheduled follow-ups: 15 minutes, 24 hours, 3 days, and 7 days.
- The Worker cron runs every 15 minutes to process pending follow-up emails. The 08:00 UTC cron still runs the daily journal generator.
- Follow-ups automatically stop when a contact status becomes `deposit_paid`, `booked`, `lost`, `completed`, or `closed`.
- The `/api/v1/admin/email-templates` endpoints power the Admin → Email screen. Template variables include `{{first_name}}`, `{{service_type}}`, `{{booking_url}}`, `{{portfolio_url}}`, and `{{unsubscribe_url}}`.
- The Worker can create the automation tables lazily, but running the latest `schema.sql` in D1 keeps the database definition explicit.
