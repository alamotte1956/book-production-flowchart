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
