# Easy Book Publishers — Book Production Tracker

## Project Overview

A full-stack book production workflow management platform ("Manuscript to Masterpiece") that helps authors track all phases of book production from concept to publication.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS 4, shadcn/ui components
- **Backend**: Node.js, Express, tRPC
- **Database**: PostgreSQL (Drizzle ORM with `pg` driver)
- **Auth**: Replit Auth (OpenID Connect via passport)
- **PDF Rendering**: Puppeteer + Chromium (Nix system package)
- **File Storage**: Local disk fallback (`.local-storage/`) when Forge API not configured; served via `/api/files/*`
- **Package Manager**: pnpm

## Architecture

- Single Express server serves both the API and the React frontend via Vite middleware in development
- All server code lives in `server/` — entry point is `server/_core/index.ts`
- Frontend lives in `client/src/`
- Shared types/utilities in `shared/`
- Database schema in `drizzle/schema.ts` (PostgreSQL)
- Auth integration in `server/replit_integrations/auth/`

## Auth Flow

- **No login required for browsing** — a guest user (openId: "guest-default-user") is auto-created and used when no Replit Auth session exists
- **Email-confirmed account required for checkout** — before Stripe checkout, users must register with name+email and confirm their email address
- Registration flow: `account.register` creates user with `openId = "email-{email}"`, generates confirmation token, sends real email via Resend
- Email confirmation: `account.confirmEmail` validates token, sets `emailConfirmed = true`
- Resend confirmation: `account.resendConfirmation` regenerates token and resends email (2-minute per-email cooldown enforced)
- **Magic link login**: `/login` page sends sign-in link via `account.sendLoginLink` mutation → stores `loginToken`/`loginTokenExpiresAt` on user → emails link to `/api/auth/magic-login?token=...`
- **Magic link verification**: Express route `/api/auth/magic-login` validates `loginToken`, creates a server-validated session (`sessionToken` stored in DB), sets `ebp_session` cookie (opaque token, httpOnly, 30-day expiry)
- **Session validation**: `context.ts` reads `ebp_session` cookie and validates against `users.sessionToken` in DB (not forgeable)
- **Logout**: `account.logout` tRPC mutation clears `sessionToken` in DB; Express route `/api/auth/logout` clears cookie and redirects to `/login`
- Email service: Resend integration (`server/resendClient.ts`) — branded HTML emails with confirm button + fallback link
- Checkout gate: `stripe.createCheckoutSession` requires `confirmedUserId` and verifies `emailConfirmed` before proceeding
- `CheckoutGate` modal component (`client/src/components/CheckoutGate.tsx`) handles the registration/confirmation flow inline on the Pricing page
- Confirmation page at `/confirm-email?token=...` for link-based verification
- Users table columns: `emailConfirmed`, `emailConfirmToken`, `loginToken`, `loginTokenExpiresAt`, `sessionToken`, `sessionTokenExpiresAt`
- Replit Auth OIDC integration still exists in code but login is not enforced; all pages are accessible without authentication
- tRPC context checks: 1) Replit OIDC claims, 2) `ebp_session` cookie validated against DB, 3) falls back to guest user
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
- **Contact Form**: Embedded at bottom of dashboard (`#contact-section`), uses `contact.send` tRPC mutation with name/email/subject/message fields and success state

## Key Features

- **9-Phase/30-Step Workflow Tracker**: Full book production pipeline from concept to publication
- **Inline Editing**: Title, author, and genre editable inline in project tracker header
- **Publishing Wizard**: 7-step onboarding wizard at `/guided-journey` with personalized roadmap
- **Auto-Produce**: AI typesetting pipeline producing real production files:
  - **Interior PDF**: Puppeteer/Chromium rendered, press-ready with proper typography
  - **KDP Print-Ready PDF**: Amazon-compliant with 0.125" bleed, gutter margins scaled by page count
  - **EPUB**: Standards-compliant ebook via epub-gen-memory with TOC, copyright page, metadata
  - **IDML (InDesign)**: Real Adobe InDesign Interchange format with paragraph/character styles, master spreads, and proper layout
  - **Input modes**: File upload (30+ formats) or direct text paste/type
  - Auto-selects scripture style for Bible projects
- **Manuscript Parsing**: Supports DOCX, DOC, ODT, PDF, EPUB, XLSX, CSV, RTF, HTML, Markdown, JSON, YAML, TXT, and more via `server/manuscriptParser.ts`
- **Real PDF Spec Sheets**: All tool pages generate downloadable PDFs via server-side Puppeteer rendering (`POST /api/render-pdf`)
- **Bible Design Studio**: Full Bible edition configurator with real PDF spec sheet export
- **Spine Calculator**: PPI-based spine width calculation with real PDF spec sheets
- **Cover Designer**: Dimensional cover spec generation with real PDF export (standard + KDP)
- **ISBN Manager**: Metadata entry and ONIX 3.0 XML download
- **Step-to-Tool Actions**: Each production step in the Project Tracker shows a contextual action button linking to the relevant built-in tool (e.g., "Open Cover Designer", "Start Auto-Produce", "Open ISBN Manager"). Defined in `STEP_TOOL_ACTIONS` map in `ProjectTracker.tsx`.
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
- **Templates Library**: Single `/templates` page with 29 EBP book templates, category filters, and search
- **Template-to-AutoProduce Flow**: Book Templates "Use This Template" pre-fills Auto-Produce style/trim via URL params
- **Spine Calculator**: Interactive spine width calculator with visual diagram, paper PPI, binding type, cover boards
- **Dashboard Command Center**: Stats bar (projects, steps, files, jobs) with real-time aggregated data
- **User Guide**: 13-chapter comprehensive guide with TOC, expand/collapse, Print Specs chapter, FAQ
- **Polished Auto-Produce Results**: Animated progress, detail chips, file type icons, status indicators
- **Polished Project Tracker**: Ornamental chapter dividers, color-coded progress lines, phase celebration effects, improved step cards
- **Project Export**: Export project summary as formatted HTML document from Project Tracker
- **Landing Page**: Full marketing landing page at `/` with hero, How It Works, tools grid, output formats, testimonials, navigation CTAs. Dashboard moved to `/dashboard`
- **Dark Mode**: Toggle in sidebar, persists to localStorage, full dark palette with CSS custom properties
- **Enhanced ISBN Manager**: ISBN-10 auto-calculation from ISBN-13, 30+ BISAC categories, LCCN field, prominent read-only ISBN-10 display
- **Guided Journey Dashboard**: New users see "Start Your Publishing Journey" CTA, wizard-completers see roadmap summary with retake option
- **Project Duplication**: Duplicate button in Project Tracker creates project copy with "(Copy)" suffix
- **Notification Center**: Bell icon in sidebar with unread count, popover dropdown, localStorage-based read tracking
- **Pricing Page**: Three tiers (Starter free, Author Pro $132 lifetime, Publisher $349 lifetime) with billing toggle, competitor comparison, and FAQ
- **Getting Started Checklist**: New projects show 6-step onboarding checklist, auto-hides after 3 completed steps
- **Resources Search & Filter**: Search bar with text highlighting, category filter pills (Writing, Editorial, Design, etc.)
- **Contact Form**: Public contact form on landing page (backend wired to contact_submissions table)
- **SEO Footer**: Global `SiteFooter` component with links to all 14 public pages, export format badges, and copyright. Added to every page (via DashboardLayout for sidebar pages, directly for standalone pages)
- **Related Tools Cross-Linking**: `RelatedTools` component shows 6 contextual tool links on every tool page for internal SEO link equity

## Affiliate Program

- **Commission**: 20% on every sale, no cap on earnings
- **Cookie Duration**: 90-day tracking cookie (`ebp_ref`) set via Express middleware on `?ref=CODE` visits
- **Cookie Type**: httpOnly, server-read only — server reads cookie in `createCheckoutSession` and passes as metadata to Stripe
- **Payouts**: Monthly via PayPal, $50 minimum threshold
- **Pages**: `/affiliates` (landing/signup), `/affiliate-dashboard` (stats/marketing/conversions/payouts)
- **tRPC Routes**: `affiliate.submitApplication`, `affiliate.getDashboard`, `affiliate.trackClick`, `affiliate.getMarketingAssets`, `affiliate.lookupByCode`
- **DB Helpers**: `server/affiliateDb.ts` — createAffiliate, getAffiliateByCode/Email/Id, recordClick, createConversion, getAffiliateStats, getDailyEarnings, payouts
- **Webhook Integration**: `checkout.session.completed` handler checks `affiliateCode` in session metadata and creates conversion record
- **Auto-approval**: Applications are auto-approved (status set to "approved" on creation)
- **Affiliate Code Format**: `{name-slug}-{nanoid(8)}` — unique per affiliate
- **Dashboard Auth**: Affiliates log in with their affiliate code (stored in localStorage)

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
- `affiliates` — Affiliate accounts (affiliateCode unique, commissionRate, status, totalClicks/Conversions/Earnings)
- `affiliate_clicks` — Click tracking (affiliateId, ipHash, userAgent, referrerUrl, landingPage)
- `affiliate_conversions` — Conversion records (affiliateId, stripeSessionId, planName, saleAmount, commissionAmount, status)
- `affiliate_payouts` — Payout history (affiliateId, amount, paypalEmail, status)

## Stripe Integration

- **Connector**: Replit Stripe connector (conn_stripe_01KK5TMD6QE6QTZXNFCCWSPP6H)
- **Library**: `stripe` + `stripe-replit-sync` for webhook/sync handling
- **Schema**: `stripe.*` tables auto-synced (products, prices, customers, subscriptions, etc.) — NEVER INSERT directly
- **Webhook**: `/api/stripe/webhook` route registered BEFORE `express.json()` with raw body parsing
- **Products**: Created via `server/seedStripeProducts.ts` (run `npx tsx server/seedStripeProducts.ts`)
  - Author Pro: monthly ($12.99), annual ($107.88/yr), lifetime ($132)
  - Publisher: monthly ($34.99), annual ($299.88/yr), lifetime ($349)
- **User columns**: `plan` (enum: starter/author_pro/publisher), `stripeCustomerId`, `stripeSubscriptionId`
- **tRPC routes**: `stripe.getSubscription`, `stripe.createCheckoutSession`, `stripe.createBillingPortal`, `stripe.getProducts`, `stripe.getPublishableKey`
- **Webhook handlers**: `checkout.session.completed` (upgrades plan), `customer.subscription.updated`, `customer.subscription.deleted` (reverts to starter)
- **Price IDs**: Hardcoded in `client/src/pages/Pricing.tsx` (PRICE_IDS constant) — update if Stripe products are recreated. NOTE: To apply new pricing ($132/$349), delete existing Stripe products first, re-run seed script, then update PRICE_IDS with new IDs

## Feature Gating

- **Hook**: `client/src/hooks/usePlan.ts` — `usePlan()` returns `{ plan, canAccess(feature), isStarter, isPro, isPublisher, projectLimit }`
- **Gate Component**: `client/src/components/UpgradeGate.tsx` — full-page or inline upgrade prompt
- **Gated Features** (require Author Pro+): `ai_typesetting`, `kdp_export`, `timeline`, `templates`, `unlimited_projects`
- **Publisher-only**: `priority_support`
- **Starter limits**: 1 book project (enforced on backend in `server/routers.ts` project.create and project.duplicate)
- **Gated pages**: AutoProduce, Timeline, Templates use wrapper Gate components that render UpgradeGate for Starter users
- **Dashboard Tool Hub**: Tools with `gatedFeature` show lock icon + "PRO" badge + "Upgrade >" for users without access; clicking redirects to /pricing. Uses `canAccess(feature)` from usePlan for proper plan-level checks.
- **Sidebar**: Lock icons on gated items for Starter users, plan label under user name, "Upgrade Plan" CTA in footer
- **Dashboard**: "Unlock Pro Publishing Tools" teaser banner for Starter users, "Upgrade for More Projects" button when project limit reached
- **Checkout Feedback**: Home.tsx and Pricing.tsx read `?checkout=success&plan=X` / `?checkout=cancelled` query params and show sonner toasts, then clean up URL
- **Privacy Policy & Terms of Service**: Combined page at `/privacy-terms` covering data collection, security, payments, IP rights, acceptable use, and liability
- **Email-Confirmed Checkout Gate**: `CheckoutGate` modal on Pricing page requires account creation with name/email + email confirmation + terms agreement before Stripe checkout
