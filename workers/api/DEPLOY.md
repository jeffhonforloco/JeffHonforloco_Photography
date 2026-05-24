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
| `ANTHROPIC_API_KEY` | Your Anthropic API key (for daily journal posts) |
| `JWT_SECRET` | Any long random string (32+ chars) |
| `ADMIN_EMAIL` | info@jeffhonforlocophotos.com |
| `ALLOWED_ORIGIN` | https://jeffhonforlocophotos.com |

### 4. Deploy via GitHub Actions
Add these secrets to your GitHub repo (Settings → Secrets → Actions):
- `CLOUDFLARE_API_TOKEN` — from Cloudflare → My Profile → API Tokens → Edit Workers
- `CLOUDFLARE_ACCOUNT_ID` — from Cloudflare sidebar

Push any change to `workers/api/**` → GitHub Action auto-deploys.

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
| GET  | /api/v1/blog | public | Blog posts list |
| GET  | /api/v1/blog/slug/:slug | public | Post by slug |
| POST | /api/v1/blog | required | Create post |
| GET  | /api/v1/portfolio | public | Portfolio images |
| GET  | /api/v1/portfolio/featured | public | Featured images |
| GET  | /api/v1/portfolio/categories | public | Category list |
| POST | /api/v1/portfolio | required | Add image |
| GET  | /api/v1/admin/dashboard | required | Dashboard stats |
| GET  | /api/v1/admin/analytics | required | Analytics |
| GET  | /api/v1/admin/export/:type | required | Export data |
| POST | /api/v1/analytics | public | Track event |
| GET  | /health | public | Health check |
