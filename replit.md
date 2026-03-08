# Create Design Publish LLC — Book Production Tracker

## Project Overview

A full-stack book production workflow management platform ("Manuscript to Masterpiece") that helps authors track all phases of book production from concept to publication.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS 4, shadcn/ui components
- **Backend**: Node.js, Express, tRPC
- **Database**: PostgreSQL (Drizzle ORM with `pg` driver)
- **Auth**: Replit Auth (OpenID Connect via passport)
- **Package Manager**: pnpm

## Architecture

- Single Express server serves both the API and the React frontend via Vite middleware in development
- All server code lives in `server/` — entry point is `server/_core/index.ts`
- Frontend lives in `client/src/`
- Shared types/utilities in `shared/`
- Database schema in `drizzle/schema.ts` (PostgreSQL)
- Auth integration in `server/replit_integrations/auth/`

## Auth Flow

- Replit Auth handles login/signup via OpenID Connect
- Login: `/api/login` → Replit OIDC → `/api/callback` → session created
- Logout: `/api/logout` → Replit end-session
- User info: `/api/auth/user` (authenticated endpoint)
- Sessions stored in PostgreSQL `sessions` table
- App users stored in `users` table, keyed by `openId` (Replit Auth `sub` claim)
- tRPC context extracts user from passport session via `req.user.claims.sub` → `users.openId`

## Running the App

The app runs on port 5000 via the "Start application" workflow (`pnpm run dev`).

## Environment Variables

Required (auto-managed by Replit):
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — Session signing secret
- `REPL_ID` — Replit app identifier (for OIDC client_id)

Optional:
- `VITE_ANALYTICS_ENDPOINT` — Analytics endpoint URL
- `VITE_ANALYTICS_WEBSITE_ID` — Analytics website ID

## Database

PostgreSQL via Replit's built-in database. Use `npx drizzle-kit push` to sync schema changes.

## Migration Notes

- Originally used MySQL (`mysql2`), migrated to PostgreSQL for Replit compatibility
- Drizzle `onDuplicateKeyUpdate` → `onConflictDoUpdate` (PostgreSQL syntax)
- Drizzle `$returningId()` → `.returning()` (PostgreSQL syntax)
- Originally used custom Manus OAuth (`createdesignpublish.net`), fully replaced with Replit Auth; all old OAuth files removed

## Design System

- **Aesthetic**: Artisan storybook / Arts & Crafts movement
- **Primary Font**: Lora (serif) — set globally via `font-serif` on body in `index.css`
- **Color Palette**:
  - `#f5d98a` — Gold text/accents
  - `#c9a96e` — Muted gold
  - `#3a2a1a` / `#2a1a0a` — Walnut dark (headers, dark panels)
  - `#f5efe0` / `#faf6ef` — Parchment light (backgrounds)
  - `#6b5f53` / `#8b7b6b` — Muted body text
  - `#4a3828` — Dark borders
  - `#e8dfd0` — Light borders
- **Dark Headers**: All tool pages use `bg-[#2a1a0a]` sticky headers with gold accents
- **Cards**: `border-[#e8dfd0] bg-white shadow-sm` pattern across tool pages
- **Contact Form**: Embedded on landing page (`#contact-section`), uses `contact.send` tRPC mutation

## Key Features

- **9-Phase/30-Step Workflow Tracker**: Full book production pipeline from concept to publication
- **Inline Editing**: Title, author, and genre editable inline in project tracker header
- **Publishing Wizard**: 7-step onboarding wizard at `/guided-journey` with personalized roadmap
- **Auto-Produce**: AI typesetting with PDF/EPUB/IDML generation, auto-selects scripture style for Bible projects
- **Bible Design Studio**: Full Bible edition configurator with spec sheet export
- **Spine Calculator**: PPI-based spine width calculation with spec sheets
- **Cover Designer**: Dimensional cover spec generation
- **ISBN Manager**: Metadata entry and ONIX 3.0 XML export
- **What's Next Banners**: Contextual next-step suggestions on all tool pages after task completion
- **Contact Form**: Public contact form on landing page

## Database Tables

- `users` — Auth users (id serial, openId varchar unique)
- `sessions` — Replit Auth session storage
- `projects` — Book projects
- `step_statuses` — Per-step completion tracking
- `uploaded_files` — File uploads per step
- `phase_due_dates` — Phase deadline tracking
- `production_jobs` — Auto-produce AI typesetting jobs
- `contact_submissions` — Contact form entries
- `wizard_sessions` — Publishing wizard answers (userId, answers jsonb, completedAt)
