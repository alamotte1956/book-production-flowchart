# Easy Book Publishers LLC — Book Production Tracker

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

- **No login required** — a guest user (openId: "guest-default-user") is auto-created and used when no Replit Auth session exists
- Replit Auth OIDC integration still exists in code but login is not enforced; all pages are accessible without authentication
- tRPC context falls back to the guest user when no authenticated session is present (`server/_core/context.ts`)
- All `protectedProcedure` endpoints work automatically since a user context is always available
- Sessions stored in PostgreSQL `sessions` table
- App users stored in `users` table, keyed by `openId`

## Running the App

The app runs on port 5000 via the "Start application" workflow (`pnpm run dev`).

## Environment Variables

Required (auto-managed by Replit):
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — Session signing secret
- `REPL_ID` — Replit app identifier (for OIDC client_id)


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
- **AI Writing Assistant**: Generate back-cover blurbs, author bios, press releases, marketing copy in Project Tracker
- **Typeface Pairings**: 8 professional font pairings in Bible Studio with one-click apply and live preview
- **Format Conversion Suggestions**: Smart error guidance when Auto-Produce fails due to unsupported formats
- **Publisher Partners**: Harvest House, Tyndale, Zondervan, BronzeBow in Resources Hub
- **Book Genres**: Christian Living, Devotional, Children's Christian, Prayer, Pastoral, Biography, Academic/Theological, Music/Audio
- **Amazon KDP Integration**: KDP-ready PDF with 0.125" bleed, KDP trim size validation, compliance checklist, cover template specs
- **Print Specs**: Press-ready file specification generator with trim size, bleed, color mode, resolution, PDF/X standard
- **Expanded Format Support**: 26 manuscript formats supported (DOCX, DOC, ODT, RTF, TXT, MD, HTML, CSV, JSON, YAML, etc.) with format badges in upload UI
- **WhatsNext in Project Tracker**: Collapsible sidebar with contextual next-step suggestions
- **Recent Activity Feed**: Dashboard feed showing latest step completions, uploads, and production jobs
- **Unified Templates Library**: Single `/templates` page combining Book Templates (CDP) and KP&A design templates with source filter (All/Book/KP&A), category filters, and search
- **Template-to-AutoProduce Flow**: Book Templates "Use This Template" pre-fills Auto-Produce style/trim via URL params
- **Spine Calculator**: Interactive spine width calculator with visual diagram, paper PPI, binding type, cover boards
- **Dashboard Command Center**: Stats bar (projects, steps, files, jobs) with real-time aggregated data
- **User Guide**: 13-chapter comprehensive guide with TOC, expand/collapse, Print Specs chapter, FAQ
- **Polished Auto-Produce Results**: Animated progress, detail chips, file type icons, status indicators
- **Polished Project Tracker**: Ornamental chapter dividers, color-coded progress lines, phase celebration effects, improved step cards
- **Project Export**: Export project summary as formatted HTML document from Project Tracker
- **Polished Landing Page**: Enhanced hero, How It Works section, testimonials/social proof, feature card hover effects
- **Dark Mode**: Toggle in sidebar, persists to localStorage, full dark palette with CSS custom properties
- **Enhanced ISBN Manager**: ISBN-10 auto-calculation from ISBN-13, 30+ BISAC categories, LCCN field, prominent read-only ISBN-10 display
- **Guided Journey Dashboard**: New users see "Start Your Publishing Journey" CTA, wizard-completers see roadmap summary with retake option
- **Project Duplication**: Duplicate button in Project Tracker creates project copy with "(Copy)" suffix
- **Notification Center**: Bell icon in sidebar with unread count, popover dropdown, localStorage-based read tracking
- **Pricing Page**: Three tiers (Starter free, Author Pro $149 lifetime, Publisher $399 lifetime) with billing toggle, competitor comparison, and FAQ
- **Getting Started Checklist**: New projects show 6-step onboarding checklist, auto-hides after 3 completed steps
- **Resources Search & Filter**: Search bar with text highlighting, category filter pills (Writing, Editorial, Design, etc.)
- **Contact Form**: Public contact form on landing page (backend wired to contact_submissions table)

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

## Stripe Integration

- **Connector**: Replit Stripe connector (conn_stripe_01KK5TMD6QE6QTZXNFCCWSPP6H)
- **Library**: `stripe` + `stripe-replit-sync` for webhook/sync handling
- **Schema**: `stripe.*` tables auto-synced (products, prices, customers, subscriptions, etc.) — NEVER INSERT directly
- **Webhook**: `/api/stripe/webhook` route registered BEFORE `express.json()` with raw body parsing
- **Products**: Created via `server/seedStripeProducts.ts` (run `npx tsx server/seedStripeProducts.ts`)
  - Author Pro: monthly ($14.99), annual ($99.99/yr), lifetime ($149)
  - Publisher: monthly ($39.99), annual ($299.88/yr), lifetime ($399)
- **User columns**: `plan` (enum: starter/author_pro/publisher), `stripeCustomerId`, `stripeSubscriptionId`
- **tRPC routes**: `stripe.getSubscription`, `stripe.createCheckoutSession`, `stripe.createBillingPortal`, `stripe.getProducts`, `stripe.getPublishableKey`
- **Webhook handlers**: `checkout.session.completed` (upgrades plan), `customer.subscription.updated`, `customer.subscription.deleted` (reverts to starter)
- **Price IDs**: Hardcoded in `client/src/pages/Pricing.tsx` (PRICE_IDS constant) — update if Stripe products are recreated
