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
