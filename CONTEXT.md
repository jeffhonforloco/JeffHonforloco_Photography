# Project Context — JeffHonforloco_Photography

## Identity
Project: JeffHonforloco_Photography
Owner: Jeff Honforloco (jeffhonforloco@gmail.com) / Tarvico Inc.
Status: Active
Site: jeffhonforlocophotos.com — personal photography portfolio & booking platform

## Stack
- Frontend: React 18 / TypeScript / Vite / Tailwind CSS / shadcn/ui (Radix UI primitives)
- Backend: Node.js / Express 4 (`/backend/`) — REST API with SQLite
- Database: SQLite via `better-sqlite3` (backend local DB)
- Cache: None
- Queue: None
- AI: Claude (via Cloudflare Worker `/api/v1/chat`) — AI sales chatbot + daily blog generation
- Auth: Custom JWT in Cloudflare Worker (`workers/api/src/routes/auth.ts`); admin credentials hashed via env vars on frontend
- Payments: None
- File storage: Local (`multer` + `sharp` image processing in backend)
- Cloud: Cloudflare Workers (`/workers/api/`) — all API, AI chatbot, email, and D1 database; frontend deploy target: Cloudflare Pages / Vercel / Netlify
- Functions: Cloudflare Worker routes (`/workers/api/src/routes/`)
- Email: Resend API (via Cloudflare Worker `/api/v1/email`)
- CI/CD: GitHub Actions (`.github/`)

## Key Paths
```
/src/pages/           ← Route-level page components (Index, Portfolio, About, Contact, Book, Admin…)
/src/components/      ← Shared UI components
/src/components/admin/  ← Admin panel sub-components
/src/components/layout/ ← Header, Footer, Navigation
/src/components/sections/ ← Homepage section components (Hero, FeaturedWork, etc.)
/src/components/portfolio/ ← Per-category portfolio views
/src/components/ui/   ← shadcn/ui primitives
/src/data/            ← Static data files (portfolio-data, hero-images, email-templates)
/src/hooks/           ← Custom React hooks
/src/lib/             ← Shared utilities (api-service, auth-security, input-validation, etc.)
/src/utils/           ← Performance & image optimization helpers
/src/types/           ← TypeScript type definitions
/backend/             ← Express API server (SQLite, JWT auth, image upload, nodemailer)
/workers/api/         ← Cloudflare Worker (Hono, D1, AI chatbot, email via Resend, JWT auth)
/public/              ← Static assets, manifest, robots.txt, sitemap, SW
```

## Routes
| Path | Page |
|---|---|
| `/` | Homepage (Index) |
| `/portfolios` | Portfolio overview |
| `/portfolios/:category` | Category portfolio |
| `/journal` | Blog / journal list |
| `/journal/:slug` | Journal article |
| `/about` | About page |
| `/contact` | Contact form |
| `/book` | Booking form |
| `/prep-guide` | Client prep guide |
| `/admin` | Admin panel (login-gated) |
| `/dashboard` | Analytics dashboard |
| `/location/:location` | Location-specific landing pages |

## Environment Variables
```
# Frontend (VITE_ prefix — exposed to browser bundle)
VITE_ADMIN_USERNAME
VITE_ADMIN_PASSWORD_HASH
VITE_ADMIN_SALT
VITE_API_BASE_URL        ← Cloudflare Worker base: https://api-jeffhonforloco-photography.*.workers.dev/api/v1
VITE_CHATBOT_URL         ← Cloudflare Worker chat: ${VITE_API_BASE_URL}/chat (derived automatically if omitted)
VITE_GA_TRACKING_ID
VITE_GTM_ID
VITE_CONTACT_EMAIL
VITE_CSRF_SECRET
VITE_SESSION_SECRET
VITE_DEBUG_MODE
VITE_LOG_LEVEL

# Cloudflare Worker Secrets (set in Dashboard → Worker → Settings → Variables, encrypted)
ANTHROPIC_API_KEY        ← Main AI chat agent + negotiation
SIREIQ_HF_TOKEN          ← Hugging Face token for SIREIQ easy chat jobs
SIREIQ_HF_MODEL          ← Optional SIREIQ model override (defaults to openai/gpt-oss-20b:fastest)
RESEND_API_KEY           ← All outbound email
JWT_SECRET               ← Admin auth tokens
ADMIN_EMAIL              ← info@jeffhonforlocophotos.com
ALLOWED_ORIGIN           ← https://jeffhonforlocophotos.com
```

## Critical Conventions
- All pages are **lazy-loaded** (`React.lazy`) — keep page components as default exports
- Admin is login-gated via hashed credentials in env vars (`auth-security.ts`); do not hard-code credentials
- Contact/booking emails route through Cloudflare Worker (`/api/v1/email/contact`) using Resend; all email logic lives in `workers/api/src/lib/email.ts`
- Image optimization runs at startup via `initializeImageOptimization()` — do not remove this call from `App.tsx`
- Use Tailwind utility classes; no hardcoded hex colors in component files
- Form validation lives in `src/lib/input-validation.ts` — reuse it rather than duplicating logic
- Error boundary wraps the entire app (`ErrorBoundary`) — do not remove it

## Do NOT
- Expose raw admin credentials or secrets in source code
- Remove the `ErrorBoundary` wrapper from `App.tsx`
- Add UUID FKs or org_id patterns — this is a single-owner site, not multi-tenant
- Skip input sanitization on contact/booking forms
- Hard-code email addresses — use `VITE_CONTACT_EMAIL` env var

## Known Deferred Items
- Real image galleries per portfolio category (currently placeholder/external images)
- Full store/print-sales integration (Shopify / Snipcart)
- CDN integration for image delivery
- Unique meta tags per journal article
- Client testimonials section

## Last Updated
2026-05-25 — Migrated to Cloudflare Workers; removed all Supabase references
