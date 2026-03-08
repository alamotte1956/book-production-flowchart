# Create Design Publish LLC — Book Production Tracker

## Project Overview

A full-stack book production workflow management platform ("Manuscript to Masterpiece") that helps authors track all phases of book production from concept to publication.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS 4, shadcn/ui components
- **Backend**: Node.js, Express, tRPC
- **Database**: PostgreSQL (Drizzle ORM with `pg` driver)
- **Auth**: Custom OAuth via `createdesignpublish.net`
- **Package Manager**: pnpm

## Architecture

- Single Express server serves both the API and the React frontend via Vite middleware in development
- All server code lives in `server/` — entry point is `server/_core/index.ts`
- Frontend lives in `client/src/`
- Shared types/utilities in `shared/`
- Database schema in `drizzle/schema.ts` (PostgreSQL)

## Running the App

The app runs on port 5000 via the "Start application" workflow (`pnpm run dev`).

## Environment Variables

Required:
- `DATABASE_URL` — PostgreSQL connection string (set by Replit automatically)
- `JWT_SECRET` — Secret for session JWT signing
- `VITE_APP_ID` — OAuth app ID for the app
- `VITE_OAUTH_PORTAL_URL` — OAuth portal URL (e.g. `https://createdesignpublish.net`)
- `OAUTH_SERVER_URL` — Server-side OAuth URL

Optional:
- `OWNER_OPEN_ID` — The owner's OAuth openId (grants admin role automatically)
- `VITE_ANALYTICS_ENDPOINT` — Analytics endpoint URL
- `VITE_ANALYTICS_WEBSITE_ID` — Analytics website ID

## Database

PostgreSQL via Replit's built-in database. Schema includes:
- `users` — Auth users
- `projects` — Book projects
- `step_statuses` — Per-step completion tracking
- `uploaded_files` — File uploads per step
- `phase_due_dates` — Phase deadline tracking
- `production_jobs` — Auto-produce AI typesetting jobs
- `contact_submissions` — Contact form entries

Run `pnpm run db:push` to sync schema changes.

## Notes

- Originally used MySQL (`mysql2`), migrated to PostgreSQL for Replit compatibility
- Drizzle `onDuplicateKeyUpdate` → `onConflictDoUpdate` (PostgreSQL syntax)
- Drizzle `$returningId()` → `.returning()` (PostgreSQL syntax)
- The OAuth system connects to `createdesignpublish.net` — the `VITE_APP_ID` must match a registered app on that platform for login to work
