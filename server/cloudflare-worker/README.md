# Cloudflare Worker Migration Target

This folder now contains the first working Cloudflare Worker slice for the backend migration:

- Node.js compatibility enabled
- Hyperdrive-ready MySQL connection
- database health-check routes

## What this Worker does today

- `GET /api/health`
  - confirms the Worker is running
- `GET /api/health/db`
  - confirms Hyperdrive can connect to MySQL
- `GET /api/health/tables`
  - lists the current tables in the connected database

This is intentionally small. It proves that Cloudflare can reach the database before we move the existing Express route groups.

## Required Cloudflare setup

In the Worker dashboard:

1. Add the compatibility flag:
   - `nodejs_compat`
2. Add a Hyperdrive binding:
   - variable name: `HYPERDRIVE`

## Recommended deploy root

If you connect this Worker from GitHub, use:

- Root directory: `server/cloudflare-worker`

## Local commands

```bash
cd server/cloudflare-worker
npm install
npm run dev
```

## Next migration phase

Once `/api/health/db` works, the next safe route groups to move are:

- `/api/auth`
- `/api/donor-auth`
- `/api/public`

After that, the rest of the admin and portal APIs can be ported module-by-module.
