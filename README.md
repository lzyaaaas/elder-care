# Creators

Full-stack web application for a nonprofit storytelling campaign supporting Elder Care Foundation.  
This project includes:

- a public campaign website
- an admin management system
- a donor portal
- an employee personal portal
- a MySQL + Prisma backend

## Project Structure

```text
front-end/
├── client/   # React + Vite + Tailwind frontend
├── server/   # Express + Prisma + MySQL backend
└── README.md
```

## Main Features

### Public site

- Home
- Our Story
- The Cause
- Gifts
- Donate
- Thank You
- Feedback

### Admin side

- Dashboard
- Donor management
- Donation management
- Receipt management
- Shipping management
- Feedback management
- Donation kit management
- Book management
- Envelope inventory
- Box inventory
- Promotion inventory
- Event management
- Promotion asset management
- Vendor management
- Invoice management
- Payables management
- Payment management
- Employee management
- Schedule management

### Self-service portals

- Donor register / sign in
- Donor portal
- Employee login
- Employee dashboard
- Employee profile
- Employee schedule

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- ORM: Prisma
- Database: MySQL
- Validation: Zod
- Auth: JWT
- Charts: Recharts

## Important Files

### Database

- [server/prisma/schema.prisma](./server/prisma/schema.prisma)
- [server/prisma/migrations](./server/prisma/migrations)
- [server/prisma/seed.js](./server/prisma/seed.js)
- [server/sql/schema.sql](./server/sql/schema.sql)
- [server/sql/seed.sql](./server/sql/seed.sql)

### Backend entry

- [server/src/index.js](./server/src/index.js)
- [server/src/app.js](./server/src/app.js)

### Frontend entry

- [client/src/App.jsx](./client/src/App.jsx)
- [client/src/routes/AppRoutes.jsx](./client/src/routes/AppRoutes.jsx)

## Before You Start

Make sure you have:

- Node.js installed
- MySQL installed and running

## Environment Setup

The backend uses an `.env` file inside `server/`.

If you do not see `.env.example` in Finder, show hidden files first:

```text
Command + Shift + .
```

Then go to:

```text
front-end/server/
```

Copy:

```text
.env.example
```

and rename the copy to:

```text
.env
```

Example `server/.env`:

```env
PORT=4000
CLIENT_URL=http://127.0.0.1:5173
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/nonprofit_storytelling_campaign"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN=7d
```

## Database Setup

### 1. Create the database

Run this in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS nonprofit_storytelling_campaign
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 2. Install dependencies

From the project root:

```bash
npm install
```

### 3. Generate Prisma client

```bash
npm run prisma:generate
```

### 4. Apply the existing Prisma schema

If this is a fresh local setup:

```bash
npm run prisma:migrate
```

If the latest schedule table migration has not been applied yet, run:

```bash
cd server
npx prisma db execute --schema prisma/schema.prisma --file prisma/migrations/20260402153000_add_schedules_employee_portal/migration.sql
```

### 5. Seed demo data

```bash
cd server
npm run seed
```

## Run the Project

### Start backend

Open one terminal:

```bash
cd server
npm run dev
```

Backend runs on:

```text
http://localhost:4000
```

### Start frontend

Open another terminal:

```bash
cd client
npm run dev -- --host 127.0.0.1
```

Frontend runs on:

```text
http://127.0.0.1:5173
```

## Cloudflare Deployment

### Frontend on Cloudflare Pages

The `client/` app is prepared for Cloudflare Pages deployment:

- Framework/build command: `npm run build`
- Output directory: `dist`
- SPA fallback: `client/public/_redirects`

Recommended Pages settings:

- Project root: `client`
- Build command: `npm run build`
- Build output directory: `dist`

Set this production environment variable in Cloudflare Pages:

```text
VITE_API_URL=https://your-worker-name.your-subdomain.workers.dev/api
```

You can copy the example from:

- `client/.env.production.example`

### Backend on Cloudflare Workers

The current backend is **not** a direct one-click Cloudflare deploy because it currently uses:

- Express as a long-running Node server
- Prisma against MySQL

For a Cloudflare-native deployment, the backend needs to move to:

- Cloudflare Workers
- Hyperdrive for MySQL connectivity
- a Worker-compatible database access layer

Migration notes and route inventory are documented here:

- `server/cloudflare-worker/README.md`

## Demo Accounts

### Admin

- Email: `admin@example.org`
- Password: `admin123`

### Employee

- Email: `operations@example.org`
- Password: `employee123`

### Donor

- Email: `demo.donor@example.org`
- Password: `donor123`

## Notes

- Do not share your real `server/.env` file with others.
- If you are sending the project to a classmate, send the source code and keep only `server/.env.example`.
- `node_modules` and `dist` folders do not need to be included in the zip.
- If login or seed fails, first check whether MySQL is running on `localhost:3306`.

## Recommended Share Version

Before sending the project to a classmate, remove:

- `node_modules`
- `client/dist`
- `server/.env`

Keep:

- source code
- `server/.env.example`
- `server/prisma`
- `server/sql`
