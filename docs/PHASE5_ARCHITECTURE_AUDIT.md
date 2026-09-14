# Phase 5 architecture audit

## Production-active path

The active application is the Vite/React frontend in `src/`, the Hono API in `workers/api/src/`, and Cloudflare D1 database `photography_db`. Frontend requests use `/api/v1` or `VITE_API_BASE_URL`; the Worker owns authentication, contacts, analytics, email, content, and admin APIs.

The acquisition source of truth is the existing `analytics` table with `ViewService`, `ViewPortfolio`, `StartBooking`, `Lead`, and `BookingConfirmed`. The CRM source of truth is the existing `contacts` table. Phase 5 reads these tables and does not duplicate either.

## Existing admin reused

Phase 5 preserves the existing login, contacts, analytics, email automation, database, security, settings, blog, portfolio, and motion screens. It reorganizes them beneath a private operating navigation and adds lazy Growth Command Center routes.

Some older admin screens contain browser-only configuration or localStorage prototypes (`AdminNavigation`, `AdminSEO`, `AdminUsers`, `AdminMotion`). They are not promoted to sources of production growth data. Production-backed modules continue to call Worker endpoints.

## Legacy / unused path

`backend/` is the prior Express/SQLite implementation. Repository deployment documentation and current frontend configuration point to the Cloudflare Worker instead. `SUPABASE_MIGRATION.md` records a prior removal; no Supabase client, package, functions, or active schema exists in the current application.

Classification:

- `workers/api`: **ACTIVE**
- `backend/`: **LEGACY / UNUSED**
- Supabase references: **LEGACY DOCUMENTATION / NOT ACTIVE**

Phase 5 does not add dependencies to or revive either legacy path.

## Security boundary

The canonical admin host is an independently deployable Pages output from the same repository. UI routing is host-aware, but hostname is not treated as authorization. The Worker requires a verified JWT and admin role for all Growth Command Center endpoints. D1 does not provide Supabase-style RLS; access control is enforced at the Worker route boundary, and the new tables have no public API routes.

## Human-control boundary

The fix workflow stores a proposal, test plan, and branch plan. It does not edit the repository, create a PR, merge, deploy, or mutate public SEO. GitHub execution is an unconnected future boundary and must remain human-approved.
