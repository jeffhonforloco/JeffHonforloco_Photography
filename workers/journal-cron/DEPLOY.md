# Deploy Instructions — journal-cron Worker

## One-time setup

```bash
cd workers/journal-cron
npm install

# 1. Create the D1 database
npx wrangler d1 create journal_db
# → Copy the database_id it prints into wrangler.toml

# 2. Run the schema migration
npx wrangler d1 execute journal_db --file=schema.sql --remote

# 3. Add the Anthropic API key (encrypted)
npx wrangler secret put ANTHROPIC_API_KEY
# → Paste your sk-ant-... key when prompted

# 4. Deploy
npx wrangler deploy
# → Note the Worker URL: https://journal-cron.YOUR_ACCOUNT.workers.dev
```

## Connect the frontend

In Cloudflare Pages → your site → Settings → Environment Variables:

```
VITE_JOURNAL_API_URL = https://journal-cron.YOUR_ACCOUNT.workers.dev
```

Trigger a new Pages build after saving.

## What happens after deploy

- Every day at 08:00 UTC the Worker calls Claude and writes 6 new posts
  (one per category) to the D1 database.
- The database keeps a rolling 90-post window.
- The frontend fetches live posts from /api/journal/posts.
- If the Worker is unreachable, the frontend falls back to /data/blog-posts.json.

## Manual trigger (test without waiting for cron)

```bash
curl -X POST https://journal-cron.YOUR_ACCOUNT.workers.dev/api/journal/generate \
  -H "Authorization: Bearer YOUR_ANTHROPIC_API_KEY"
```
