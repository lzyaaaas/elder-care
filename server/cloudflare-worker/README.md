# Cloudflare Worker Migration Target

This folder is the migration target for moving the current Express + Prisma backend onto Cloudflare's platform.

## Why this is a migration, not a toggle

The current server is built around:

- a long-running Node.js process
- Express middleware and route registration
- Prisma talking directly to MySQL

Cloudflare's production path is different:

- frontend on Cloudflare Pages
- backend on Cloudflare Workers
- database access through Hyperdrive and a Worker-compatible database driver

That means this backend needs to be adapted module-by-module instead of copied over unchanged.

## Recommended migration order

1. Deploy the `client/` app to Cloudflare Pages
2. Stand up a new Worker API with the same `/api/*` route surface
3. Move the easiest endpoints first:
   - `/health`
   - public read endpoints
   - auth endpoints
4. Replace Prisma data access with a Worker-compatible DB layer using Hyperdrive
5. Migrate admin modules one domain at a time

## Current route groups to migrate

- `/api/auth`
- `/api/donor-auth`
- `/api/donor-portal`
- `/api/employee-portal`
- `/api/public`
- `/api/dashboard`
- `/api/admin-analytics`
- `/api/employees`
- `/api/donors`
- `/api/donation-receivables`
- `/api/receipts`
- `/api/schedules`
- `/api/shippings`
- `/api/feedback`
- `/api/donation-kits`
- `/api/books`
- `/api/envelopes`
- `/api/boxes`
- `/api/promotion-inventory`
- `/api/events`
- `/api/promotion-assets`
- `/api/vendors`
- `/api/invoices`
- `/api/payables`
- `/api/payments`

## Cloudflare-specific notes

- Cloudflare Pages can build the Vite frontend with `npm run build` and publish `dist/`
- The frontend should point `VITE_API_URL` at the deployed Worker URL
- Hyperdrive is the Cloudflare-recommended bridge for existing MySQL from Workers
- The Worker should enable Node.js compatibility because much of this codebase assumes Node-style APIs

## Suggested next implementation phase

Create a new Worker entry that exposes:

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/donor-auth/login`
- `POST /api/public/donations`

Once that thin slice works against Hyperdrive, the remaining route groups can be migrated behind the same `/api` surface.
