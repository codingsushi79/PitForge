# PitForge

Endurance racing strategy, live telemetry, and team coordination for Le Mans Ultimate.

## Features

- **Strategy planner** — Stints, fuel, virtual energy, tyres, pit loss, timeline, driver workload
- **Teams & lineups** — Shared workspaces with class-specific driver groups
- **Live telemetry** — Pit wall with standings, track maps, weather, and warnings
- **Setup sharing** — Upload and download setup files with your team
- **PitForge Link** — Desktop app to stream LMU shared memory telemetry

## Quick start (local)

```bash
npm install
npm run dev
```

Uses SQLite by default — no database setup required. Open http://localhost:3000 and create an account.

## Deploy to Vercel + PostgreSQL

Very doable. The app is already structured for it:

| Component | Local | Production |
|-----------|-------|------------|
| Database | SQLite (auto) | Neon Postgres via `DATABASE_URL` |
| Setup uploads | `data/uploads/` | Cloudflare R2 via S3 API |
| Web app | `next dev` | Vercel deploy |
| PitForge Link | Runs on driver PC | Stays on driver PC (not deployed) |

### Steps

1. **Create a Neon database** — Vercel dashboard → Storage → Neon Postgres. Sets `DATABASE_URL`.

2. **Push the schema:**
   ```bash
   DATABASE_URL="your-neon-url" npm run db:push
   ```

3. **Create a Cloudflare R2 bucket:**
   - Cloudflare dashboard → R2 → Create bucket (e.g. `pitforge-setups`)
   - R2 → Manage R2 API tokens → Create token with Object Read & Write on that bucket
   - Copy Account ID, Access Key ID, and Secret Access Key

4. **Set env vars on Vercel:**
   - `DATABASE_URL` — Neon connection string
   - `JWT_SECRET` — random 32+ char string
   - `R2_ACCOUNT_ID` — Cloudflare account ID
   - `R2_ACCESS_KEY_ID` — R2 API token access key
   - `R2_SECRET_ACCESS_KEY` — R2 API token secret
   - `R2_BUCKET_NAME` — bucket name (e.g. `pitforge-setups`)

5. **Deploy:**
   ```bash
   vercel deploy
   ```

Setup files are served through PitForge's download API (private bucket — no public access required).

**PitForge Link** runs on the Windows gaming PC with LMU — it POSTs telemetry to your deployed API. No WebSocket server needed on Vercel; the current polling model works fine.

### Estimated effort

The Postgres migration is already wired in. If you have a Neon database URL, you're roughly **30 minutes from production** — mostly Vercel dashboard clicks and one `db:push`.

## PitForge Link

```bash
BRIDGE_SESSION_ID=<session-id> npm run bridge
```

Use `BRIDGE_DEMO=1` to test without LMU.

## Tech stack

- Next.js 15 · Drizzle ORM · SQLite or Neon Postgres · Cloudflare R2 · Tailwind CSS 4

## License

MIT — Not affiliated with Studio 397.
