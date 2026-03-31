# TDM Socials - Social Content Generator

AI-powered daily social media content ideas delivered to clients via email, with an admin dashboard for client management and invoicing.

## Architecture

```
                        Caddy (reverse proxy)
                       /         |          \
                      /          |           \
          /api/*     /   /admin/*|    /*      \
                    v            v             v
               Backend      Admin Frontend   Public Site
              (NestJS)      (React SPA)      (React SPA)
              :4000         :3000            :3001
                 |
        +--------+--------+--------+
        |        |        |        |
    Postgres   Redis    OpenAI    SMTP
     :5432     :6379              :465
```

## What It Does

1. **Daily Content Emails** — Every day at 8 AM, the backend generates AI content ideas (TikTok, Instagram, Facebook, Twitter) per industry via OpenAI, and emails them to all clients.
2. **Admin Dashboard** — Login at `/admin`, manage clients (add/delete), view email stats, generate PDF invoices.
3. **Public Site** — Landing page at `/` advertising the service with a contact form.

## Project Structure

```
├── backend/              NestJS API (TypeORM, PostgreSQL, Redis)
├── frontend/             Admin dashboard (React, Redux, Tailwind)
├── frontend-public/      Public landing page (React, Tailwind)
├── infra/                Docker Compose, Caddy configs, deploy scripts
└── docker-compose.dev.yml  Local dev: Postgres + Redis only
```

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- An OpenAI API key
- SMTP credentials (private mail server, e.g. smtp.privateemail.com)

---

## Local Development

### 1. Start Postgres + Redis

```bash
docker compose -f docker-compose.dev.yml up -d
```

| Service  | Host      | Port |
|----------|-----------|------|
| Postgres | localhost | 5432 |
| Redis    | localhost | 6379 |

Default DB creds: `nestuser` / `nestpassword` / `backend_db`

### 2. Configure the backend

Edit `backend/.env.local` and fill in:

```env
OPENAI_API_KEY=sk-...          # Required for content generation
SMTP_USER=info@tdmsocials.nl   # Required for sending emails
SMTP_PASS=your-password        # Required for sending emails
```

Everything else has sensible defaults for local dev.

### 3. Start the backend

```bash
cd backend
npm install
npm run start:local
```

Runs on **http://localhost:4000**. TypeORM auto-creates tables on first run.

### 4. Create an admin user

```bash
cd backend
npm run create-admin
```

Creates `admin@admin.com` / `admin123`. Override with `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars.

### 5. Start the admin frontend

```bash
cd frontend
npm install
npm start
```

Runs on **http://localhost:3000**. Open **http://localhost:3000/admin/login** and log in.

### 6. Start the public site (optional)

```bash
cd frontend-public
npm install
npm start
```

Runs on **http://localhost:3001**. Contact form posts to `localhost:4000`.

### Local ports summary

| Service          | URL                              |
|------------------|----------------------------------|
| Backend API      | http://localhost:4000             |
| Admin Dashboard  | http://localhost:3000/admin/login |
| Public Site      | http://localhost:3001             |
| Swagger Docs     | http://localhost:4000/api-docs    |
| Postgres         | localhost:5432                    |
| Redis            | localhost:6379                    |

---

## Production Deployment (VPS)

### What you need before deploying

- **A VPS** with Docker & Docker Compose installed
- **A managed PostgreSQL database** (e.g. DigitalOcean, Railway, Supabase, or any hosted Postgres). The app does **not** run its own database container in production — you provide a connection string.
- **DNS** pointing `tdmsocials.nl` (and `www.tdmsocials.nl`) to your VPS IP
- **SMTP credentials** for `info@tdmsocials.nl`
- **OpenAI API key**

### First-time setup

```bash
# 1. SSH into your VPS and clone the repo
git clone <your-repo-url> && cd socialContentGenerator/infra

# 2. Create the production environment file
cp env/backend.env.example env/backend.env
```

Edit `env/backend.env` with your real credentials:

```env
# Database — your managed Postgres connection details
DB_HOST=your-db-host.com
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# Auth — generate strong secrets for production
JWT_SECRET=generate-a-long-random-string-here
JWT_RESET_SECRET=generate-another-random-string

# OpenAI
OPENAI_API_KEY=sk-...

# SMTP
SMTP_HOST=smtp.privateemail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@tdmsocials.nl
SMTP_PASS=your-smtp-password
SMTP_FROM=info@tdmsocials.nl
SMTP_FROM_NAME=TDM Socials

# Admin
ADMIN_CONTACT_EMAIL=info@tdmsocials.nl
FRONTEND_DOMAIN=https://tdmsocials.nl,https://www.tdmsocials.nl
```

```bash
# 3. Set the production Caddyfile (pre-configured for tdmsocials.nl)
cp Caddyfile_prod Caddyfile

# 4. Deploy everything (one command)
./deploy-bg.sh
```

That's it. One script builds all three services, starts them, runs health checks, and configures the reverse proxy. Caddy automatically provisions HTTPS via Let's Encrypt.

### What `deploy-bg.sh` does

1. `git pull` latest code
2. Builds all 3 images in parallel (backend, admin frontend, public frontend)
3. Starts the **new** backend container (blue or green)
4. Waits for `/health/live` to return OK (up to 60s)
5. Switches Caddy to the new backend (zero-downtime reload)
6. Stops the **old** backend container
7. Recreates both frontend containers
8. Runs smoke tests on `/api/health/live`, `/admin`, and `/`

### Subsequent deploys

```bash
cd infra
./deploy-bg.sh
```

Same single command every time. It auto-detects which backend is active and swaps to the other.

### Create the first admin user (one-time)

```bash
cd infra
docker compose exec backend_green sh -c "node scripts/create-admin-user.js"
```

Then log in at `https://tdmsocials.nl/admin/login` with `admin@admin.com` / `admin123`.

### Production routing

| URL                              | Service          | Container Port |
|----------------------------------|------------------|----------------|
| `https://tdmsocials.nl/api/*`    | Backend          | 4000           |
| `https://tdmsocials.nl/admin/*`  | Admin Dashboard  | 3000           |
| `https://tdmsocials.nl/*`        | Public Site      | 3001           |

### Production services (docker-compose.yml)

| Service          | Image                       | Port | Notes                        |
|------------------|-----------------------------|------|------------------------------|
| caddy            | caddy:2                     | 80, 443 | Reverse proxy, auto-HTTPS |
| redis            | redis:7-alpine              | 6379 | Session cache                |
| backend_blue     | Built from `/backend`       | 4000 | Blue-green pair              |
| backend_green    | Built from `/backend`       | 4000 | Blue-green pair              |
| frontend_admin   | Built from `/frontend`      | 3000 | Admin React SPA              |
| frontend_public  | Built from `/frontend-public` | 3001 | Public React SPA           |

**Note:** PostgreSQL is **not** in docker-compose. Use a managed database service and set the connection details in `env/backend.env`. TypeORM `synchronize: true` auto-creates tables on first boot.

---

## Key Backend Modules

| Module                    | Purpose                                                    |
|---------------------------|------------------------------------------------------------|
| `AuthModule`              | JWT login, register, password reset, token refresh         |
| `UsersModule`             | Admin user management (separate from clients)              |
| `ClientsModule`           | CRUD for client businesses (name, email, industry, stats)  |
| `AiModule`                | OpenAI wrapper — generates content ideas per industry      |
| `ContentModule`           | Composes HTML emails + orchestrates daily send             |
| `SchedulerModule`         | Cron job at 8 AM daily (`@nestjs/schedule`)                |
| `InvoiceModule`           | HTML → PDF invoice generation via Puppeteer                |
| `OutgoingCommunicationModule` | Nodemailer SMTP email sending                         |
| `AdminModule`             | Dashboard data, contact form, manual cron trigger          |
| `HealthModule`            | `/health/live` and `/health/ready` endpoints               |

## Key API Endpoints

| Method | Path                        | Auth   | Description                    |
|--------|-----------------------------|--------|--------------------------------|
| POST   | `/auth/login`               | Public | Admin login                    |
| POST   | `/auth/register`            | Public | Admin registration             |
| GET    | `/clients`                  | Admin  | List all clients               |
| POST   | `/clients`                  | Admin  | Add a client                   |
| DELETE | `/clients/:id`              | Admin  | Delete a client                |
| GET    | `/admin/dashboard`          | Admin  | Dashboard data (all clients)   |
| POST   | `/admin/trigger-daily-cron` | Admin  | Manually send daily emails     |
| POST   | `/admin/contact`            | Public | Contact form (rate-limited)    |
| POST   | `/invoices/generate`        | Admin  | Generate + download invoice PDF|
| GET    | `/health/live`              | Public | Liveness check                 |
| GET    | `/health/ready`             | Public | Readiness check (DB)           |

## Database Tables

**`users`** — Admin accounts (JWT auth)
- id, username, email, password, role, createdAt, updatedAt

**`clients`** — Businesses receiving daily emails
- id, name, email, industry, totalEmailsSent, emailsSinceLastInvoice, lastInvoiceDate, createdAt, updatedAt

Invoices are generated on-the-fly as PDFs and **not stored** in the database.

## Environment Variables

See `infra/env/backend.env.example` for the full list. The critical ones:

| Variable         | Required | Description                          |
|------------------|----------|--------------------------------------|
| `OPENAI_API_KEY` | Yes      | OpenAI API key for content generation|
| `SMTP_USER`      | Yes      | SMTP username                        |
| `SMTP_PASS`      | Yes      | SMTP password                        |
| `JWT_SECRET`     | Prod     | JWT signing secret (has dev default) |
| `DB_HOST`        | Prod     | PostgreSQL host                      |
| `DB_PASSWORD`    | Prod     | PostgreSQL password                  |

## Tech Stack

| Layer    | Technology                                          |
|----------|-----------------------------------------------------|
| Backend  | NestJS 11, TypeORM, PostgreSQL, Redis, Puppeteer    |
| Admin UI | React 19, Redux Toolkit, Tailwind CSS, Axios        |
| Public   | React 19, Tailwind CSS                              |
| AI       | OpenAI (gpt-4o-mini)                                |
| Email    | Nodemailer over SMTP                                |
| Proxy    | Caddy 2 (auto-HTTPS in production)                  |
| Deploy   | Docker Compose, blue-green deployment               |
