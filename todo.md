# Book Production Project Tracker — Upgrade TODO

## Phase 1: Infrastructure
- [x] Upgrade to web-db-user (backend + database + file storage)
- [x] Design database schema (projects, steps, inputs, uploaded files)

## Phase 2: Backend
- [x] Create database migration with tables for projects, step_status, uploaded_files
- [x] Build API endpoints: GET/POST project, PATCH step status (complete/skip), file upload/download
- [x] Wire up S3 file storage for manuscript/document uploads

## Phase 3: Frontend
- [x] Add file upload dropzones to each step's input slots
- [x] Add "Complete" and "Skip" buttons per step
- [x] Show overall progress bar with completed/skipped/remaining counts
- [x] Show uploaded file names with download links
- [x] Keep the artisan storybook design aesthetic

## Phase 3b: Bug Fixes
- [x] Fix button event propagation (Skip/Complete buttons bubbling to card toggle)

## Phase 4: Testing
- [x] Test upload flow end-to-end (vitest)
- [x] Test skip/complete toggling (vitest)
- [x] Test progress tracking accuracy (vitest)

## Phase 5: Skill
- [x] Package the workflow as a reusable skill

## Phase 6: Enhancements
- [x] Export/print view — button to expand all steps and generate printable project summary
- [x] Due dates per phase — optional target dates with on-schedule tracking indicator
- [x] Landing page polish — improve project list page design and UX
- [x] Fix auth redirect (show login prompt instead of 'Project not found' when unauthenticated)
- [x] Full testing and checkpoint

## Phase 7: Duplicate Project Feature
- [x] Add backend `project.duplicate` tRPC endpoint (copies title, author, genre, notes into new project)
- [x] Add "Duplicate" button to project cards on the Home page
- [x] Add "Duplicate" button to the project tracker header
- [x] Write vitest tests for the duplicate endpoint

## Phase 8: Layout Change
- [x] Move all step cards to far-left aligned layout

## Phase 9: Resources & Success Hub
- [x] Research top publishing and creative industry websites
- [x] Build a Resources page with curated links organized by production phase (8 categories, 43 resources)
- [x] Add industry stats section to landing page + Resources teaser block + header nav link
- [x] Test and checkpoint (17/17 tests pass)

## Phase 10: Step-to-Resources Deep Links
- [x] Map each of the 30 flowchart steps to its Resources page section anchor
- [x] Add a "Resources" link button inside each expanded step card
- [x] Ensure the Resources page section anchors match the link targets
- [x] Add hash-based scroll-to-section on Resources page

## Phase 11: Timing & Organization Upgrade
- [x] Add estimated duration (days) to each step in flowchartData.ts
- [x] Extend step_status table with startDate and targetDate columns
- [x] Extend projects table with productionDeadline column
- [x] Add step.setDates and project_deadline.set tRPC endpoints
- [x] Build Gantt-style timeline view page (/timeline/:id)
- [x] Build compact project dashboard table (all steps, phases, status, dates)
- [x] Add notes summary panel (collapsible, shows all step notes in grid)
- [x] Add production deadline to Timeline page header with risk warnings
- [x] Add schedule risk warnings (overdue/due-soon/on-track) per step
- [x] Add Timeline button to project tracker header
- [x] Write vitest tests for step.setDates and project_deadline.set (23 total pass)

## Phase 12: SEO Fixes
- [x] Set page title to 30–60 characters via document.title
- [x] Add meta description (50–160 characters)
- [x] Add meta keywords tag

## Phase 13: Auto-Produce AI Mode
- [x] Install mammoth (docx parsing), pdf-parse (PDF text extraction) dependencies
- [x] Install puppeteer-core for PDF rendering, epub-gen-memory for EPUB
- [x] Add manuscript upload and parsing server endpoint
- [x] Build LLM chapter-detection and typesetting pipeline
- [x] Generate styled HTML from manuscript using chosen style template
- [x] Render press-ready PDF (correct margins, running headers, page numbers)
- [x] Generate EPUB from structured manuscript content
- [x] Store PDF and EPUB in S3 and save references in DB
- [x] Add Auto-Produce page at /auto-produce/:id
- [x] Build upload + configuration UI (trim size dropdown, style picker, drag-and-drop)
- [x] Build job status polling with progress indicator
- [x] Build download section for PDF and EPUB outputs
- [x] Add Auto-Produce button to project tracker header
- [x] Write vitest tests for autoProduce router (29 total tests pass)

## Phase 14: Style Preview
- [x] Add `autoProduce.preview` tRPC endpoint that returns styled sample HTML for any style + trim size
- [x] Build live preview panel in Auto-Produce page (modal dialog with iframe, updates on style/trim change)
- [x] Show sample content: chapter heading, body paragraph, drop cap, running header, page number
- [x] Add "Looks good — continue" CTA inside the preview modal footer
- [x] Write vitest tests for the preview endpoint (11 tests: all styles, all trim sizes, fallbacks, auth)

## Phase 15: JSON-LD Structured Data
- [x] Add SoftwareApplication JSON-LD schema to the home page (injected via script tag in useEffect)
- [x] Add WebSite JSON-LD schema with SearchAction for sitelinks search box
- [x] Add Organization JSON-LD schema for brand identity

## Phase 16: Dropdowns for All Decision Areas
- [x] Create Project dialog: convert genre free-text to dropdown with 20 preset genres
- [x] Project Tracker: convert Complete/Skip/Pending buttons to a status dropdown per step
- [x] Auto-Produce: add output format dropdown (Both PDF+EPUB / PDF only / EPUB only)
- [x] Timeline page: due-date status is a visual indicator only (no user decision needed — kept as-is)

## Phase 17: Genre-Based Step Filtering
- [x] Design genre-to-step relevance map (which steps are irrelevant for which genres)
- [x] Add getIrrelevantStepIds(genre) + getFilterReason() helpers to shared/genreFilter.ts
- [x] Project Tracker: auto-hide irrelevant steps when project has a genre set
- [x] Add genre filter info banner in tracker header when filtering is active
- [x] Add "N steps hidden for [genre] — click to show" toggle per phase with animated reveal
- [x] Hidden steps shown at 50% opacity with "Not needed for [genre]" badge and tooltip
- [x] Write 43 vitest tests for genre filtering helper (genre sets, step hiding, reasons, edge cases)

## Phase 18: Edit Genre from Tracker Header
- [x] Add updateProjectGenre() helper to server/db.ts
- [x] Add project.updateGenre tRPC mutation to server/routers.ts
- [x] Add GenreEditor inline popover component in tracker header with genre dropdown
- [x] Genre display shows "(edit)" hint on hover; shows "+ Add genre" when no genre is set
- [x] On save: invalidates project query so filtering re-applies immediately, shows toast

## Phase 19: Inline Title & Author Editing in Tracker Header
- [ ] Add updateProjectMeta() db helper (updates title and/or author)
- [ ] Add project.updateMeta tRPC mutation to server/routers.ts
- [ ] Add TitleEditor inline popover component (text input, min 1 char validation)
- [ ] Add AuthorEditor inline popover component (optional text input)
- [ ] Both editors show edit hint on hover and save with Enter key support

## Phase 20: Add Bible / Scripture Genre
- [x] Add "Bible / Scripture" to GENRES list in Home.tsx (Create Project dialog)
- [x] Add "Bible / Scripture" to GENRES list in ProjectTracker.tsx (GenreEditor)
- [x] Added to NONFICTION_GENRES; hides 'proposal' and 'review' steps (direct-to-publisher path)
- [x] Added filter reason text for proposal and review steps
- [x] 6 new vitest tests; total now 89 passing

## Phase 21: Scripture / Reference Typesetting Style
- [x] Registered "scripture" style in TYPESETTING_STYLES (Gentium Book Plus font, 9.5pt, 1.45 leading, doubleColumn+verseNumbers flags)
- [x] Added renderVerseText() and textToHtmlParagraphsScripture() helpers in typesettingPipeline.ts
- [x] generateBookHtml uses scripture renderer when doubleColumn+verseNumbers are set; column-count:2 CSS injected
- [x] Preview endpoint: scripture shows Genesis 1 sample text, double-column layout, verse superscripts, "Holy Bible" running header
- [x] 8 new vitest tests for scripture style; total now 97 passing

## Phase 22: Auto-Select Scripture Style by Genre
- [ ] Auto-Produce page: when project genre is "Bible / Scripture", pre-select "scripture" style on load
- [ ] Show a subtle info note explaining why the style was pre-selected
- [ ] Allow user to override the pre-selection manually

## Phase 23: Comprehensive Bible Publishing System

### 23a — Bible Trim Sizes & Typesetting Styles
- [ ] Add all standard Bible trim sizes: Compact (4.25×6.5), Standard (5.25×8), Wide Margin (6.5×9.25), Pew (5.5×8.5), Large Print (6×9), Giant Print (7×10), Reference (6.25×9.25), Journaling (6×9 wide margin), Children's (7×9)
- [ ] Add Bible typesetting style variants: Double Column Standard, Double Column Red Letter, Single Column Narrative, Wide Margin Study, Journaling (ruled margins), Large Print, Children's Illustrated, Pew/Devotional
- [ ] Add paper type field: India/Bible paper (24lb), Thin Offset (28lb), Standard Offset (50lb), Cream Offset

### 23b — Bible Edition Types
- [ ] Add Bible edition type to project creation: Standard, Study, Journaling, Pew, Large Print, Giant Print, Children's, Red Letter, Reference, Devotional, Parallel
- [ ] Auto-configure trim size and style based on edition type selection
- [ ] Add translation/version field: KJV, NIV, ESV, NKJV, NLT, NASB, CSB, AMP, MSG, Custom

### 23c — Bible-Specific Production Steps
- [ ] Add Bible-specific phase: Text Preparation (versification check, red-letter tagging, poetry formatting, section headings)
- [ ] Add Bible-specific phase: Reference Apparatus (cross-references, concordance, footnotes, maps, index)
- [ ] Add Bible-specific phase: Special Features (study notes, devotional content, journaling lines, illustrations)
- [ ] Add Bible-specific phase: Pre-Press Specifications (paper spec, binding spec, gilding, ribbon marker, thumb index)
- [ ] Genre filter: when genre is Bible/Scripture, show Bible-specific phases and hide general fiction/nonfiction phases

### 23d — Auto-Produce Bible Options
- [ ] Add red-letter toggle (words of Christ rendered in red/crimson)
- [ ] Add cross-reference column toggle (center-column or footnote style)
- [ ] Add section headings toggle
- [ ] Add poetry formatting toggle (Psalms/Proverbs in stanza format)
- [ ] Add verse-per-line toggle (each verse on its own line vs prose run-on)
- [ ] Add margin style dropdown: Standard, Wide (1.5in), Journaling (2.5in ruled), Study (2in)
- [ ] Add column layout dropdown: Double Column, Single Column Narrative, Single Column with Wide Margin

### 23e — Bible Spine Width Calculator
- [ ] Add a Bible Spine Calculator tool/page: inputs are page count, paper type (PPI), and cover material
- [ ] Calculate spine width = page count / PPI + cover boards
- [ ] Show binding specifications: Smyth-sewn, perfect bound, case bound, limp leather
- [ ] Export spec sheet as PDF

## Phase 24: Complete Bible Publishing Platform

### 24a — Bible Design Studio Page
- [ ] New page /bible-studio: full-page Bible edition configurator
- [ ] Edition type selector (12 types) with description and feature list
- [ ] Translation/version selector (13 translations + custom)
- [ ] Trim size selector showing Bible-specific sizes with diagrams
- [ ] Typesetting style selector (9 Bible styles) with live preview
- [ ] Paper type selector with PPI and description
- [ ] Binding type selector with durability rating
- [ ] Special features toggles: red letter, cross-references, footnotes, section headings, poetry stanzas, verse-per-line, concordance, maps, ribbon marker, thumb index, gilded edges
- [ ] Live spec summary panel showing all selected options
- [ ] "Start Production" CTA linking to Auto-Produce with pre-filled settings
- [ ] "Export Spec Sheet" button generating a PDF spec document

### 24b — Bible Production Phases in Tracker
- [ ] Add Bible-specific phases to flowchartData: Text Preparation, Reference Apparatus, Special Features, Pre-Press Specifications
- [ ] Genre filter: show Bible phases only when genre is Bible/Scripture

### 24c — Project Creation Bible Fields
- [ ] Add Bible edition type dropdown to Create Project dialog
- [ ] Add Bible translation/version dropdown
- [ ] Auto-configure trim size and style when edition type is selected

### 24d — Spine Width Calculator Page
- [ ] New page /spine-calculator: interactive spine width calculator
- [ ] Inputs: page count, paper type (PPI), binding type
- [ ] Output: spine width in inches and mm, with visual diagram
- [ ] Binding spec summary for print-ready file setup

### 24e — Auto-Produce Bible Options
- [ ] Add red-letter toggle
- [ ] Add cross-reference column toggle
- [ ] Add section headings toggle
- [ ] Add poetry stanza formatting toggle
- [ ] Add margin style dropdown
- [ ] Add column layout dropdown

## Phase 25: IDML (InDesign) Export
- [ ] Build server/idmlGenerator.ts — generates a valid IDML package (mimetype, designmap.xml, Spreads, MasterSpreads, Resources/Styles, Stories)
- [ ] Support Bible scripture style: double-column text frames, verse number character style, running headers
- [ ] Support all typesetting styles: paragraph styles mapped from CSS to InDesign equivalents
- [ ] Wire IDML generation into autoProduce.start pipeline (alongside PDF and EPUB)
- [ ] Upload IDML zip to S3 and store URL in production_jobs table
- [ ] Add IDML download button to job results page in AutoProduce.tsx
- [ ] Write vitest tests for the IDML generator

## Phase 26: Universal File Format Import
- [ ] Install xlsx, node-rtf-parser, and other needed parsing libraries
- [ ] Extend manuscriptParser.ts to handle: .xlsx, .xls, .csv, .numbers, .rtf, .html, .htm, .md, .markdown, .odt, .pages, .txt, .text, .tsv, .json
- [ ] Update MIME type detection to cover all new formats
- [ ] Update Auto-Produce file picker accept attribute to include all supported formats
- [ ] Show supported format list in the upload area UI
- [ ] Write vitest tests for each new file format parser

## Phase 27: World-Class Publishing Platform Upgrade
- [ ] Fix all 3 failing tests (bibleSpecs style fields, preview scripture style, IDML page dimensions)
- [ ] Update Auto-Produce file picker to accept all 25+ formats with format badge grid
- [ ] Polish Auto-Produce page: professional upload zone, animated progress, rich results card
- [ ] Polish Bible Design Studio: full-page configurator with live spec summary and export
- [ ] Polish home page: publishing-grade hero, project cards, stats, and CTAs
- [ ] Polish project tracker: professional phase headers, step cards, and progress indicators

## Phase 27: World-Class Polish (Completed)
- [x] Fixed nested button HTML error in Home.tsx header nav
- [x] Added Bible Publishing Tools section to home dashboard (Bible Studio, Spine Calculator, New Bible Project cards)
- [x] Added Bible Studio and Spine Calculator nav links to home header
- [x] Fixed all 3 failing tests (bibleSpecs field names, scripture style preview, IDML trim size ID)
- [x] All 181 tests passing
- [x] Universal file format support: .docx, .pdf, .txt, .md, .rtf, .xlsx, .xls, .csv, .numbers, .odt, .html, .epub
- [x] IDML (InDesign) export wired into Auto-Produce pipeline with download button
- [x] Bible phases injected into Project Tracker for Bible/Scripture projects
- [x] Bible edition type and translation fields added to Create Project dialog
- [x] Bible Design Studio page at /bible-studio
- [x] Spine Width Calculator page at /spine-calculator

## Phase 28: Creator, Designer & Publisher's Dream Platform

### 28a — Publisher Command Center (Home Page)
- [ ] Redesign home dashboard as a full command center with feature hub grid
- [ ] Add quick-access cards for all major tools: Projects, Auto-Produce, Bible Studio, Cover Designer, ISBN Manager, Print Specs, Spine Calculator, Resources, Timeline
- [ ] Add recent activity feed showing last 5 actions across all projects
- [ ] Add publishing stats bar: total projects, steps completed, files produced

### 28b — Cover Designer Tool
- [ ] New page /cover-designer: spec generator for front cover, back cover, and spine
- [ ] Inputs: trim size, page count, paper type, binding → calculates full wrap dimensions
- [ ] Cover spec sheet with bleed, safe zone, and spine width diagram
- [ ] Export spec as PDF for sending to cover designers

### 28c — ISBN & Metadata Manager
- [ ] New page /isbn-manager: per-project ISBN, LCCN, BISAC codes, CIP data
- [ ] Fields: ISBN-13, ISBN-10 (auto-calculated), publisher, imprint, edition, language, BISAC category
- [ ] Auto-embed metadata into generated PDFs and EPUBs
- [ ] Export metadata as ONIX 3.0 XML for distribution

### 28d — Print Spec Sheet Generator
- [ ] New page /print-specs: generates a complete press-ready file specification document
- [ ] Covers: trim size, bleed, safe zone, color mode, resolution, font embedding, PDF/X standard
- [ ] Bible-specific specs: paper type, PPI, spine width, binding, gilding, ribbon
- [ ] Export as PDF spec sheet for sending to printer

### 28e — AI Writing Assistant
- [ ] Add AI assistant panel to project tracker sidebar
- [ ] Features: generate back-cover blurb, author bio, press release, marketing copy, BISAC description
- [ ] Bible-specific: generate table of contents description, study note summaries, devotional intros

## Phase 28 Completion Status

### 28a — Publisher Command Center (Home Page)
- [x] Redesign home dashboard as a full command center with feature hub grid (8 tools)
- [x] Add quick-access cards for all major tools: Bible Studio, Auto-Produce, Spine Calculator, Cover Designer, ISBN Manager, Timeline, Resources, New Project
- [x] Add publishing stats bar: total projects, phases, steps per project, tracked inputs
- [x] Richer project cards with progress bar, genre/bible badges, and Timeline quick-link

### 28b — Cover Designer Tool
- [x] New page /cover-designer: full-wrap cover spec generator
- [x] Inputs: trim size, page count, paper type, binding → calculates full wrap dimensions
- [x] Cover spec sheet with bleed, safe zone, spine width, and color mode
- [x] Export spec as printable HTML/PDF for sending to cover designers
- [x] Registered route in App.tsx

### 28c — ISBN & Metadata Manager
- [x] New page /isbn-manager: ISBN-13, ISBN-10 (auto-calculated), LCCN, BISAC codes, CIP data
- [x] Fields: publisher, imprint, edition, language, BISAC category, subtitle, description
- [x] Export metadata as ONIX 3.0 XML for distribution
- [x] Registered route in App.tsx

### 28d — Bible Design Studio Spec Sheet Export
- [x] Export Spec Sheet button now opens a print-ready HTML page with all specs
- [x] Spec sheet includes: edition, translation, trim, typography, paper, binding, spine width, active features

### 28e — AI Writing Assistant
- [x] Added AI Writing Assistant panel to Bible Design Studio sidebar (collapsible)
- [x] Features: back-cover blurb, author bio, catalog description, press release, marketing email
- [x] Tone selector: literary, commercial, academic, inspirational, devotional
- [x] Copy-to-clipboard for generated content
- [x] Added ai.generateCopy tRPC endpoint in server/routers.ts using invokeLLM

## Phase 29: Additional Bible Translations
- [x] Add NASB (New American Standard Bible) to BIBLE_TRANSLATIONS in shared/bibleSpecs.ts (was already present)
- [x] Add NASB 2020 (New American Standard Bible 2020 Update) to BIBLE_TRANSLATIONS in shared/bibleSpecs.ts
- [x] Add ISV (International Standard Version) to BIBLE_TRANSLATIONS in shared/bibleSpecs.ts

## Phase 30: Typeface Options in Bible Design Studio
- [x] Add TYPEFACES data (serif, italic, sans-serif bold categories with named fonts) to shared/bibleSpecs.ts
- [x] Add body text typeface selector to BibleStudio typography section
- [x] Add heading/chapter title typeface selector to BibleStudio
- [x] Add verse number typeface selector to BibleStudio
- [x] Show live typeface preview in the spec summary panel

## Phase 31: Recommended Pairings Panel
- [ ] Add TYPEFACE_PAIRINGS lookup table to shared/bibleSpecs.ts
- [ ] Build RecommendedPairings component in BibleStudio
- [ ] Auto-apply pairing on one-click "Use This Pairing" button
- [ ] Show live three-font preview in the pairings panel

## Phase 32: SEO Fixes
- [x] Reduce meta keywords on home page (/) from 9 to 3-8 focused keywords

## Phase 33: Public Domain Translations
- [x] Add KJV + Apocrypha to BIBLE_TRANSLATIONS in shared/bibleSpecs.ts
- [x] Add ASV (American Standard Version 1901) to BIBLE_TRANSLATIONS
- [x] Add WEB variants (WEB Catholic, WEBBE, World Messianic Bible) to BIBLE_TRANSLATIONS
- [x] Add BSB (Berean Standard Bible) to BIBLE_TRANSLATIONS
- [x] Add OEB (Open English Bible) to BIBLE_TRANSLATIONS
- [x] Add DRA (Douay-Rheims 1899) to BIBLE_TRANSLATIONS
- [x] Add GNV (Geneva Bible 1599) to BIBLE_TRANSLATIONS
- [x] Add YLT (Young's Literal Translation) to BIBLE_TRANSLATIONS
- [x] Add DARBY (Darby Translation) to BIBLE_TRANSLATIONS
- [x] Add Webster Bible to BIBLE_TRANSLATIONS
- [x] Add Brenton English Septuagint to BIBLE_TRANSLATIONS
- [x] Add publicDomain and ukRestriction fields to BibleTranslation type
- [x] Group translations in Bible Studio UI: Public Domain / Licensed / Custom
- [x] Show Public Domain, UK Restriction, and Licensed badges on translation cards

## Phase 34: Chromium Path Fix
- [x] Find the correct Chromium binary path in the sandbox (/usr/lib/chromium-browser/chromium-browser)
- [x] Update executablePath in server/typesettingPipeline.ts from shell wrapper to actual binary
- [x] Verified: puppeteer launches successfully and generates a PDF with the new path
- [x] All 181 tests pass after the fix

## Phase 35: Inline Error Detail Panel
- [x] Add inline error detail panel to Auto-Produce status page for failed jobs
- [x] Show full error message, timestamp, job ID, and file name in the panel
- [x] Add a Retry button that re-submits the same job configuration
- [x] Add a server-side retry endpoint (autoProduce.retry mutation)
- [x] Style the panel with clear error state (red border, icon, expandable detail)
- [x] Add Copy Error button to clipboard
- [x] Add collapsible Technical Details panel with diagnostic monospace table
- [x] Add contextual troubleshooting tip in the technical details panel

## Phase 36: Retry Count Limit
- [x] Add retryCount column (default 0) to production_jobs table in drizzle/schema.ts
- [x] Run pnpm db:push to migrate the database (migration 0007 applied)
- [x] Update autoProduce.retry mutation to check retryCount < 3 before allowing retry
- [x] Increment retryCount on the new job when retrying
- [x] Return retryCount in autoProduce.status query (flows through full job object)
- [x] Disable Retry button in UI when retryCount >= 3
- [x] Show "Max retries reached" message with instructions to upload a new file
- [x] Show current retry attempt number (e.g. "Retry Job (2 of 3)") on Retry button
- [x] Show Retry Attempts row in Technical Details diagnostic panel

## Phase 37: Automatic Format Conversion Suggestions
- [ ] Add errorType field to production_jobs table (enum: format_unsupported, parse_empty, pipeline_error, unknown)
- [ ] Run pnpm db:push to migrate the database
- [ ] Classify error type in the start and retry mutations when job fails
- [ ] Return errorType in the status query
- [ ] Show format conversion tip in error panel when errorType is format_unsupported or parse_empty
- [ ] List recommended conversion tools (LibreOffice, Word, Google Docs, Pandoc) in the tip
- [ ] Show the detected file extension in the tip message

## Phase 38: Guided "What's Next?" Prompt System
- [x] Fix classifyError scope bug (moved to module scope in routers.ts)
- [x] Create shared/prompts.ts with contextual prompt rules engine
- [x] Build WhatsNext React component with step cards and action buttons
- [x] Add WhatsNext panel to Home dashboard (based on project state via trpc.prompts.getContext)
- [x] Add prompts.getContext tRPC query to server/routers.ts
- [ ] Add WhatsNext sidebar to project tracker page
- [ ] Add contextual next-step banner to Auto-Produce page after job completes
- [ ] Add contextual next-step banner to Bible Design Studio after spec export
- [ ] Add contextual next-step banner to Spine Calculator after calculation
- [ ] Add contextual next-step banner to Cover Designer after spec export

## Phase 39: Guided Publishing Onboarding Wizard
- [ ] Build PublishingWizard multi-step component (client/src/components/PublishingWizard.tsx)
- [ ] Step 1: What do you want to publish? (Bible, Novel, Non-Fiction, Children's Book, Poetry, Memoir, Textbook, Other)
- [ ] Step 2: Is this your first time publishing? (Yes / No)
- [ ] Step 3: Do you have a manuscript ready? (Yes / In progress / Not started)
- [ ] Step 4: What format do you want to publish in? (Print / eBook / Both)
- [ ] Step 5: Do you have an ISBN? (Yes / No / Not sure what that is)
- [ ] Step 6: What is your target audience? (General / Children / Academic / Religious / Other)
- [ ] Step 7: What is your timeline? (ASAP / 1-3 months / 3-6 months / 6+ months)
- [ ] Build GuidedJourney page (/guided-journey) showing personalized roadmap with instructions
- [ ] Roadmap shows numbered steps, each with: what it is, why it matters, how to do it in this program
- [ ] Each roadmap step has a direct "Go to Tool" button
- [ ] Add wizard trigger to dashboard (prominent "Start Your Publishing Journey" CTA for new users)
- [ ] Add wizard trigger to the landing page hero section
- [ ] Save wizard answers to database (new wizard_sessions table)
- [ ] Add server endpoint: wizard.saveAnswers mutation
- [ ] Add server endpoint: wizard.getAnswers query
- [ ] Register /guided-journey route in App.tsx
- [ ] Show personalized greeting on GuidedJourney page based on answers

## Phase 41: Rebrand to Create Design Publish LLC
- [ ] Replace all "The Bookmaker's Journey" with "Create Design Publish LLC" across all files

## Phase 43: User Guide Web Page
- [ ] Build UserGuide page at /guide with full instruction book content
- [ ] Add "Guide" nav link to the dashboard navigation bar
- [ ] Register /guide route in App.tsx

## Phase 44: User Guide Title Polish
- [x] Make User Guide hero title letters brighter (pure white, text-white) and larger (text-5xl md:text-6xl)
- [x] Add /guide route to App.tsx
- [x] Add Guide link to dashboard nav bar with HelpCircle icon

## Phase 45: Landing Page Company Name
- [x] Add "Create Design Publish LLC" prominently to the landing page hero (text-6xl/text-8xl, pure white with glow, gold "Publish LLC")

## Phase 46: Learn More Scroll Button
- [x] Add animated "Learn More" scroll button below CTA on landing page hero (bouncing ChevronDown with motion.div)
- [x] Add id="features" anchor to the features section for scroll target

## Phase 47: One-Line Hero Title
- [x] Remove line break from landing page hero title — now reads on one line (whitespace-nowrap, text-4xl/text-6xl/text-7xl)

## Phase 48: Company Tagline
- [x] Add "From Manuscript to Masterpiece" tagline below hero title on landing page (gold serif, spaced uppercase, glow)

## Phase 49: Tagline Update & Footer
- [ ] Update tagline to "Manuscript to Masterpiece"
- [ ] Add professional footer with website (createdesignpublish.net) and contact email, no social icons

## Phase 50: Gold Hero Title
- [x] Change hero title "Create Design Publish LLC" to all-gold letters (#f5d98a with glow)

## Phase 51: Sign In / Create Account
- [x] Add getSignUpUrl() helper to const.ts (type=signUp)
- [x] Add sticky top nav bar to landing page with Sign In and Create Account buttons
- [x] Replace single hero CTA with Create Free Account + Sign In button pair
- [x] Add id=tools-section anchor for nav scroll link
- [x] Update bottom CTA section with dual Create Account / Sign In buttons
- [x] Add proper footer with logo, website, email, copyright
- [x] Add account dropdown menu in dashboard header (user name, Guide link, Sign Out)

## Phase 52: Mobile Hamburger Menu
- [x] Add hamburger icon button (visible only on mobile) to dashboard header
- [x] Build slide-out drawer with all nav links (Bible Studio, Spine Calc, Cover Designer, ISBN, Resources, Guide)
- [x] Add close button and backdrop overlay to the drawer
- [x] Drawer closes on nav link click and backdrop click

## Phase 53: Keyword Integration
- [x] Update meta title, description, and keywords with Self-Publishing, Online Publishing, Create, Design, Publishing
- [x] Update JSON-LD structured data description and featureList
- [x] Update hero description paragraph with keywords
- [x] Update features section heading and cards with keywords
- [x] Update tool showcase section heading with keywords
- [x] Update bottom CTA copy with keywords

## Phase 54: Extended Keyword Coverage
- [x] Update index.html title, meta description, and meta keywords
- [x] Update dashboard header subtitle ("Publisher Command Center" → keyword-rich)
- [x] Update Resources page h1 and intro text with keywords
- [x] Update Guide page subtitle and intro text with keywords
- [x] Update The Publishing Landscape h2 on Resources page

## Phase 55: Sitemap & Robots
- [x] Create sitemap.xml in client/public/ with all public pages and correct canonical domain
- [x] Create/update robots.txt to reference the sitemap
- [x] Add canonical link tag and sitemap link tag to index.html

## Phase 56: Contact Email
- [x] Update footer contact email to John.Peterson@createdesignpublish.net

## Phase 57: SEO Meta Fixes
- [x] Reduce meta keywords from 10 to 6 focused terms
- [x] Shorten page title to 50 characters (was 72) in index.html and Home.tsx
- [x] Shorten meta description to 149 characters (was 253) in index.html and Home.tsx

## Phase 58: Robots Meta Tags
- [x] Add meta robots index,follow to index.html (SPA shell)
- [x] Add meta robots index,follow dynamically in Home.tsx setMetaTag

## Phase 59: Internal Backlinks
- [x] Add "Related Tools" section to Resources page linking to all 6 tools
- [x] Add "Related Tools" section to UserGuide page linking to all 6 tools
- [x] Add footer backlink bar to SpineCalculator, IsbnManager, BibleStudio, AutoProduce, Timeline, CoverDesigner

## Phase 60: Server-Side Route Meta Tags
- [x] Create shared/routeMeta.ts with per-route title, description, keywords, robots for all 9 pages
- [x] Add injectRouteMeta() in server/_core/vite.ts for both dev (setupVite) and production (serveStatic) modes
- [x] Verified all 9 routes return unique title, description, canonical in raw HTML via curl
- [x] Update sitemap.xml lastmod dates and add /auto-produce and /timeline entries (9 URLs total)

## Phase 61: Open Graph & Twitter Card Meta Tags
- [x] Generate branded OG preview image (1200x630) and upload to CDN
- [x] Extend shared/routeMeta.ts with ogImage, ogType, twitterCard, siteName fields
- [x] Updated injectRouteMeta() in vite.ts to inject 14 OG/Twitter tags per route
- [x] Verified tags appear correctly in raw HTML via curl for / and /bible-studio

## Phase 62: Logo Replacement
- [ ] Copy uploaded logo to webdev-static-assets and upload to CDN
- [ ] Replace logo in dashboard header (Home.tsx)
- [ ] Replace logo in landing page nav bar (Home.tsx)
- [ ] Update favicon if appropriate

## Phase 62: Logo Replacement (Site-wide)
- [x] Replace old logo CDN URL with new CDPlargelogo.PNG in Home.tsx (6 occurrences)
- [x] Replace old logo in JSON-LD logo field
- [x] Replace old logo in UserGuide.tsx (CDP_LOGO constant)
- [x] Replace old logo in PublishingWizard.tsx
- [x] Verified 0 old logo references remain, 7 new logo references in place

## Phase 63: Universal File Processing
- [x] Audited: server file.upload endpoint already accepts any MIME type and stores to S3
- [x] Audited: ProjectTracker file input already has no accept restriction
- [x] Expanded AutoProduce ACCEPTED_TYPES to include images (PNG/JPG/WebP/TIFF/GIF/SVG) and archives (ZIP/RAR)
- [x] Expanded AutoProduce ACCEPTED_EXT to include all image and archive extensions
- [x] Raised AutoProduce MAX_FILE_SIZE_MB from 15 to 50
- [x] Updated drop zone label and error message to list all supported formats
- [x] All 181 tests pass, TypeScript 0 errors

## Phase 64: Image Thumbnail Preview in Drop Zone
- [x] Add previewUrl state (string | null) to AutoProduce
- [x] Generate object URL when an image file is selected, revoke on cleanup
- [x] Render thumbnail (max-h-40) inside the drop zone when previewUrl is set
- [x] Show file name, size, and "click to change" hint below the thumbnail
- [x] Non-image files show the existing CheckCircle icon instead
- [x] All 181 tests pass, TypeScript 0 errors

## Phase 65: ZIP File Content Preview in Drop Zone
- [x] Install jszip package
- [x] Add zipContents state (array of {name, size} | null) to AutoProduce
- [x] Read ZIP file client-side with JSZip when a .zip file is selected
- [x] Render scrollable file list (max-h-36) with type icons (FileText, Image, FileSpreadsheet, FileCode, File) and KB sizes
- [x] Empty or unreadable ZIP shows a warning message
- [x] ZIP contents cleared when file is changed or cleared
- [x] All 181 tests pass, TypeScript 0 errors

## Phase 66: CDP Publishing Catalog Integration
- [x] Add Bible edition types to Bible Studio (Youth, Gift, Interlinear, Harmony of the Gospels, Expanded Text)
- [x] Add Auto-Produce typesetting styles for Christian Living, Devotionals, Children's Christian, Prayer, Pastoral, Biography, Theological, Music/Audio (already in bibleSpecs.ts)
- [ ] Update Resources Hub to include CDP's publisher partners (Harvest House, Tyndale, Zondervan, BronzeBow)

## Phase 67: CDP Book Templates Page
- [x] Create shared/cdpTemplates.ts with one-click presets for all CDP book types
- [x] Build CDPTemplates.tsx page with visual cards for each book type
- [x] Add "Use This Template" button that pre-fills Auto-Produce settings
- [x] Wire /cdp-templates route in App.tsx and add to dashboard nav
- [x] Add CDP Templates link to landing page tools section (TOOLS array + desktop/mobile nav)
- [ ] Update Resources Hub with CDP publisher partners
