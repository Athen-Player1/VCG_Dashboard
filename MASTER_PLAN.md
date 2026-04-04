# VGC Dashboard Master Plan

This is the living build plan for the Pokemon VGC dashboard. It should be updated whenever scope changes, a feature moves forward, or priorities shift.

## Product Goal

Build a Dockerized web app for Pokemon VGC that lets a user:

- save and manage multiple teams
- import teams from Pokemon Showdown
- analyze team weaknesses and role gaps
- compare saved teams against current meta snapshots
- generate matchup plans for common teams and archetypes
- later run automated battle simulations in the background

## Current Stack

- Frontend: Next.js App Router + Tailwind CSS
- Backend: FastAPI
- Database: PostgreSQL
- Runtime: Docker Compose

## Current Status

### Completed

- Git repository initialized
- Dockerized full-stack scaffold created
- Stitch-inspired routed UI shell created
- Real app routes added for dashboard, teams, analysis, meta, and testing
- Dashboard wired to API-backed data
- Showdown import parser endpoint implemented
- Showdown import UI implemented
- PostgreSQL team storage added
- Seed teams loaded into database at startup
- Team list and team detail pages wired to persisted data
- Team CRUD for metadata added
  - create blank team
  - edit team metadata
  - delete team
- Showdown import can now save directly into persisted teams
- Shared master plan document added and designated as a tracked markdown file
- Chip-style editing added for team member types and move lists
- Builder validation added for incomplete slots, duplicate species, and move/type limits
- First deterministic team analysis endpoint added for saved teams
- Team detail pages now surface structural analysis results from the API

### In Progress

- Builder UX polish is underway so editing feels closer to a real drafting workflow
- Expanding the deterministic analysis engine beyond the first structural pass

### Not Started

- Type/role/synergy analysis engine
- Meta snapshot persistence and admin workflow
- Compare-vs-meta workflow using saved teams
- Matchup plan generation
- Background battle simulator

## Working Features Right Now

- View dashboard
- View saved teams
- Open team detail pages
- Create blank teams
- Edit team metadata
- Delete teams
- Edit up to six team slots on a saved team
- See dynamic Pokemon sprite previews in the builder based on species names
- Clear individual team slots in the builder
- Edit moves and types using chip-style inputs instead of comma-only text fields
- See inline validation feedback for invalid or conflicting slot data
- Parse Showdown exports
- Save imported Showdown teams
- Load deterministic structural analysis on each saved team detail page
- Run app in Docker
- Search teams from the top navigation search form
- Navigate between dashboard, teams, analysis, meta, and testing routes

## Build Phases

## Phase 1: Foundation

Goal: establish a usable product shell with real routing and persistence.

Status: complete for the initial scaffold milestone

Included:

- Dockerized frontend, backend, and database
- Routed dashboard UI
- Showdown import parser
- Team persistence
- Team CRUD for metadata
- Shared master planning document

## Phase 2: Team Builder

Goal: make saved teams truly editable.

Status: next priority

Tasks:

- add/edit/remove team members
- create six-slot team builder layout
- edit item, ability, role, tera type, and move list per member
- polish validation and editing feedback in the builder
- improve form and species/form handling
- support empty slots and draft states
- allow imported teams to be refined after save

Progress:

- metadata CRUD is complete
- six-slot editing is live
- chip-style move/type editing is live
- dynamic sprite previews are live
- first-pass validation is live

## Phase 3: Analysis Engine

Goal: provide deterministic recommendations and weakness reports.

Status: in progress

Tasks:

- type overlap and weakness aggregation
- speed control coverage
- role coverage checks
- offensive and defensive profile notes
- pivot/redirection/disruption support checks
- recommendation output for common structural issues

Progress:

- saved teams now have a deterministic analysis endpoint
- team detail pages now render structural readouts
- current analysis includes type stacking, defensive buckets, speed-control checks, utility checks, and practical recommendations

## Phase 4: Meta Comparison

Goal: compare saved teams against dated format snapshots.

Tasks:

- create format and meta snapshot tables
- store dated top-team snapshots
- surface common threats and archetypes
- compare a selected team to snapshot teams
- highlight pressure points and exposed slots

## Phase 5: Matchup Planning

Goal: generate practical game plans using the saved team and meta data.

Tasks:

- lead suggestions
- preserve targets and win-condition notes
- danger checklist
- matchup summaries against common archetypes
- matchup summaries against top stored teams

## Phase 6: Simulation

Goal: add the deferred battle simulator without forcing a rewrite.

Status: explicitly deferred until core product is complete

Tasks:

- worker service in Docker
- queued simulation jobs
- repeated matchup runs
- stored win/loss summaries
- recurring weakness reporting

## Immediate Next Steps

1. Keep polishing builder ergonomics around species/forms and slot editing flow.
2. Expand the analysis engine with richer role and matchup heuristics.
3. Feed analysis outputs into the dedicated Analysis page as well as team detail pages.
4. Start the meta snapshot persistence layer once the analysis model feels solid.

## Last Updated Snapshot

- Current active milestone: Analysis Engine
- Last completed milestone: Team Builder
- Current progress: saved teams support six-slot editing, dynamic sprite loading, chip-style move/type editing, validation, and first-pass deterministic structural analysis
- Current next recommendation: deepen the analysis model and begin reusing it across the dedicated analysis experience

## Notes

- Meta data should be snapshot-based and dated, not hardcoded as universally current.
- When move recommendations and suggested sets are added, Smogon should be used as the primary moveset reference source.
- The battle simulator remains a later-phase feature by design.
- This document is intended to stay concise and operational rather than become a design essay.
