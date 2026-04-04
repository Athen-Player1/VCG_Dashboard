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
- Dedicated Analysis page now loads and compares a selected saved team using the same analysis engine
- Meta snapshots now persist in PostgreSQL and the Meta page reads the active stored snapshot
- First-pass compare-vs-meta summaries now render for a selected saved team against active snapshot teams
- Weakness chart and richer matchup-plan fields are now live in the core team and meta workflows
- Meta snapshots can now be imported and activated from the Meta workspace

### In Progress

- Builder UX polish is underway so editing feels closer to a real drafting workflow
- Expanding the deterministic analysis engine beyond the first structural pass
- Reusing analysis outputs across more product surfaces before deeper matchup planning work begins
- Building compare-vs-meta behavior on top of persisted snapshot data
- Turning compare output into fuller matchup plans with better lead and danger heuristics
- Adding practical research hooks so moveset work can jump directly into Smogon references
- Snapshot-management UX can still be polished, but the core import/activate flow is now functional

### Not Started

- Type/role/synergy analysis engine
- Meta snapshot persistence and admin workflow
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
- Open the dedicated Analysis desk for a specific saved team
- Load the active persisted meta snapshot in the Meta workspace
- Generate first-pass matchup summaries for a selected team against active snapshot teams
- View a full weakness chart for a saved team
- Open Smogon Dex and Smogon Search links directly from team builder slots
- Import and activate meta snapshots through the Meta workspace
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
- the dedicated Analysis page now lets the user choose a saved team and inspect the live structural readout
- current analysis includes type stacking, a full weakness chart, defensive buckets, speed-control checks, utility checks, and practical recommendations

## Phase 4: Meta Comparison

Goal: compare saved teams against dated format snapshots.

Status: in progress

Tasks:
- create format and meta snapshot tables
- store dated top-team snapshots
- surface common threats and archetypes
- compare a selected team to snapshot teams
- highlight pressure points and exposed slots

Progress:

- meta snapshots are now stored in PostgreSQL
- the dashboard now pulls threat and meta data from the active stored snapshot
- the Meta page now loads the active snapshot through dedicated API routes
- saved team flows can now deep-link into the Meta workspace for comparison context
- selected teams now receive first-pass matchup summaries against the active snapshot teams
- matchup summaries now include preserve targets, win conditions, tera notes, and danger checklists
- snapshots can now be imported and activated without manual database edits

## Phase 5: Matchup Planning

Goal: generate practical game plans using the saved team and meta data.

Tasks:

- lead suggestions
- Add a weakness chart widget
- Automate the loading of meta and top team snapshots from the web
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
3. Polish snapshot-management UX and optional web-ingestion helpers.
4. Keep the simulator deferred until the core non-sim workflow feels complete.

## Last Updated Snapshot

- Current active milestone: Analysis Engine
- Last completed milestone: Team Builder
- Current progress: saved teams support six-slot editing, dynamic sprite loading, chip-style move/type editing, validation, a weakness chart, deterministic structural analysis, a team-aware Analysis workspace, persisted meta snapshots, richer compare-vs-meta matchup plans, and in-app snapshot management
- Current next recommendation: the core non-simulator product loop is in place; remaining work is mostly polish and future automation

## Notes

- Meta data should be snapshot-based and dated, not hardcoded as universally current.
- When move recommendations and suggested sets are added, Smogon should be used as the primary moveset reference source.
- The battle simulator remains a later-phase feature by design.
- This document is intended to stay concise and operational rather than become a design essay.
