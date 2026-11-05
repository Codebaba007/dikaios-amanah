# Deploying Dikaios Amanah

Production topology:

| Layer    | Service                | Free tier                              |
| -------- | ---------------------- | -------------------------------------- |
| Frontend | Vercel (Vite + React)  | Hobby                                  |
| API      | Render (Node web svc)  | Free (sleeps after 15 min idle)        |
| Database | Neon (PostgreSQL 16)   | Free (0.5 GB storage, autosuspend)     |
| Uploads  | Local disk, or any S3-compatible bucket (R2 / Supabase / S3) | — |

The local Docker stack and the hosted stack are independent: the public site
never depends on the developer's computer.

## Why the API is not on Vercel Functions

Express *can* run as a Vercel Function, but this API has three properties that
make a long-lived Node service the better fit, so the mission's fallback rule
("do not force an unsuitable architecture") applies:

1. **File uploads.** Verification documents arrive as multipart uploads. Vercel
   Functions have a ~4.5 MB request body limit and an ephemeral filesystem, so
   uploads need object storage *and* a smaller limit to be correct.
2. **Database connections.** Prisma opens a pool per process; serverless
   invocations multiply pools and exhaust a free PostgreSQL instance's
   connection limit unless a pooler (Neon `-pooler`) is used everywhere.
3. **Cold starts.** bcrypt hashing plus Prisma engine startup on every cold
   invocation makes login noticeably slower than on a warm server.

Render runs the unmodified `node src/server.js`, keeps `/api/health` warm for
its health check, and deploys straight from this repository's `render.yaml`.

---

## 1. Database — Neon

1. Create a project at <https://console.neon.tech> (region closest to the API —
   `ap-southeast-1` / Singapore for Bangladesh).
2. Copy **two** connection strings from *Connection Details*:
   - **Pooled** (`...-pooler...`) — this becomes `DATABASE_URL` for the API.
   - **Direct** (no `-pooler`) — used only when running migrations.
3. Apply the schema from this machine (never from the browser):

   ```bash
   cd backend
   DATABASE_URL="<direct-neon-url>" npx prisma migrate deploy
   DATABASE_URL="<direct-neon-url>" npx prisma migrate status
   ```

4. Create the administrator account (administrators cannot self-register):

   ```bash
   DATABASE_URL="<direct-neon-url>" \
   ADMIN_EMAIL="admin@example.com" \
   ADMIN_PASSWORD="<strong-password>" \
   node scripts/create-admin.js
   ```

5. Optionally copy existing data from the local database:

   ```bash
   pg_dump "postgresql://admin:password@localhost:5433/dikaios_amanah" \
     --no-owner --no-privileges > dikaios_export.sql
   psql "<direct-neon-url>" -f dikaios_export.sql
   ```

   `pg_dump` writes only data and schema for the public schema; run it against
   the **local** database and keep the dump out of Git (`.gitignore` already
   covers `dikaios_backup*.sql`).

## 2. API — Render

1. Push this branch, then in Render: **New → Blueprint**, select the repository.
   `render.yaml` declares the service, build command, start command and health
   check.
2. Fill the `sync: false` variables in the dashboard:

   | Variable        | Value                                                    |
   | --------------- | -------------------------------------------------------- |
   | `DATABASE_URL`  | Neon **pooled** connection string                         |
   | `JWT_SECRET`    | 48+ random bytes, hex (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
   | `FRONTEND_URL`  | `https://<project>.vercel.app` (comma-separate to add a custom domain) |
   | `STORAGE_DRIVER`| `local` (default) or `s3`                                 |
   | `S3_*`          | Only when `STORAGE_DRIVER=s3`                             |

3. Deploy, then confirm:

   ```bash
   curl https://<service>.onrender.com/api/health
   # {"status":"ok","message":"Backend is running","database":"connected",...}
   ```

   A `503` with `"database":"disconnected"` means `DATABASE_URL` is wrong or the
   Neon project is suspended — the health check deliberately fails in that case.

## 3. Frontend — Vercel

1. **Add New → Project**, import the repository, set **Root Directory** to
   `frontend`. Vercel reads `frontend/vercel.json`:
   - Build command `npm run build`, output `dist`
   - SPA rewrite to `/index.html` (React Router deep links work on refresh)
   - Security headers and immutable asset caching
2. Environment variable:

   | Variable       | Environments                  | Value                          |
   | -------------- | ----------------------------- | ------------------------------ |
   | `VITE_API_URL` | Production **and** Preview    | `https://<service>.onrender.com` |

   Vite inlines this at build time, so it must be present *before* the build —
   changing it afterwards requires a redeploy.
3. Deploy, open the URL, and hard-refresh a deep link (e.g. `/investor/browse`)
   to confirm the SPA rewrite.

## 4. Upload storage

`STORAGE_DRIVER=local` writes to `backend/uploads` (or `os.tmpdir()` on
ephemeral hosts). Fine for a demo, but files are lost on redeploy/restart.

For durable storage set `STORAGE_DRIVER=s3` plus:

```
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com   # omit for AWS S3
S3_REGION=auto                                              # e.g. ap-southeast-1 for AWS
S3_BUCKET=dikaios-documents
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

The bucket should be **private**: documents are identity material. Only the
object key and SHA-256 hash are stored in PostgreSQL
(`Document.storageReference` / `integrityHash`), so nothing sensitive is public.
Cloudflare R2 (10 GB free) and Supabase Storage (1 GB free) both speak this API.

## 5. Verification after deploying

```bash
# API + database + all three role workflows against the live deployment
API_URL="https://<service>.onrender.com" \
ADMIN_EMAIL="admin@example.com" \
ADMIN_PASSWORD="<admin-password>" \
node scripts/smoke-test.mjs
```

Expected: every check `PASS`. The script creates synthetic `@smoke.test`
accounts and campaign data, so it is safe to run repeatedly against a demo
database (delete the rows afterwards if the demo data must stay clean).

## 6. Costs and limits

| Service | Plan | Limit that matters                                        |
| ------- | ---- | --------------------------------------------------------- |
| Vercel  | Hobby | 100 GB bandwidth/month; commercial use requires Pro      |
| Render  | Free | 750 instance-hours/month; sleeps after 15 min idle (~50 s cold start) |
| Neon    | Free | 0.5 GB storage, autosuspend after 5 min idle, ~100 compute-hours/month |
| R2 / Supabase | Free | 10 GB / 1 GB storage                                     |

No paid plan is required for a course demonstration. Nothing in this project
processes real money.

## 7. Known limitations

- Render's free instance sleeps; the first request after idle is slow. A cron
  ping keeps it warm at the cost of instance-hours.
- `STORAGE_DRIVER=local` on Render loses uploaded files across deploys.
- Profit declaration endpoints exist but the UI only displays them.
- No email verification or password reset flow is implemented.
- The audit ledger is hash-chained and tamper-evident, but it is not a
  blockchain and provides no external notarisation or regulatory certification.
