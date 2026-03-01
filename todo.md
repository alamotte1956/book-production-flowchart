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
- [ ] Package the workflow as a reusable skill
