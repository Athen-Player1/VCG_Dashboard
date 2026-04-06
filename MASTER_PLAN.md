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
- Tournament-result snapshot automation is now live through Victory Road URL imports
- Common archetype plans and a Top 5 Teams page are now live from the active snapshot
- Frontend linting is now wired through ESLint and passes in Docker
- Backend smoke tests now run through pytest and pass in Docker
- The app now starts with an empty saved-team workspace so handoff users begin from a blank builder instead of seeded demo teams
- Builder species/form handling now normalizes common aliases more safely for duplicate checks and sprite refreshes

### In Progress

- Builder UX polish is underway so editing feels closer to a real drafting workflow
- Expanding the deterministic analysis engine beyond the first structural pass
- Recommendation quality is now a dedicated follow-on phase focused on turning structural analysis into sharper builder and matchup advice
- Snapshot-management UX can still be polished, but the core import/activate flow is now functional
- Tournament-result ingestion is now the primary automation path; Showdown usage can remain a secondary future signal
- A dedicated Showdown engine service now validates and normalizes teams for builder checks and simulation preflight
- Handoff polish is underway around empty states, QA tooling, and general readiness for new users
- Most remaining work is polish, deeper heuristics, and simulation accuracy rather than missing core workflow pages

### Not Started

- No major product phases remain unstarted for the requested scope

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
- Start from an empty saved-team workspace on first run
- Load deterministic structural analysis on each saved team detail page
- Open the dedicated Analysis desk for a specific saved team
- Load the active persisted meta snapshot in the Meta workspace
- Generate first-pass matchup summaries for a selected team against active snapshot teams
- View a full weakness chart for a saved team
- Open Smogon Dex and Smogon Search links directly from team builder slots
- Import and activate meta snapshots through the Meta workspace
- Import tournament-result snapshots from Victory Road event URLs
- Run app in Docker
- Run frontend linting in Docker
- Run backend smoke tests in Docker
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
- common form aliases now resolve more consistently during builder editing and save flows

## Phase 3: Analysis Engine

Goal: provide deterministic recommendations and weakness reports.

Status: complete for the MVP product scope

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

Status: complete

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
- Victory Road event pages can now be converted directly into stored snapshots

## Phase 5: Matchup Planning

Goal: generate practical game plans using the saved team and meta data.

Status: complete

Tasks:

- lead suggestions
- Add a weakness chart widget
- Automate the loading of meta and top team snapshots from the web
- preserve targets and win-condition notes
- danger checklist
- matchup summaries against common archetypes
- A page on the top 5 teams
- matchup summaries against top stored teams

Progress:

- matchup summaries now include lead suggestions, preserve targets, win conditions, tera notes, and danger checklists
- the Meta page now renders common archetype plans for the selected team
- the app now has a dedicated Top 5 Teams page driven by the active snapshot
- matchup planning is available both at the individual top-team level and the repeated-archetype level

## Phase 6: Simulation

Goal: add the deferred battle simulator without forcing a rewrite.

Status: complete for the requested scope

Tasks:

- worker service in Docker
- queued simulation jobs
- repeated matchup runs
- stored win/loss summaries
- recurring weakness reporting

Progress:

- background simulation jobs are now persisted in PostgreSQL
- a dedicated worker service is now part of Docker Compose
- the Testing page now launches 10-game queued runs against the active top meta team or a pasted Showdown opponent
- completed runs now store win/loss results, repeated issues, top threats, and follow-up recommendations
- a dedicated Showdown engine service now validates and packs teams before simulation work uses them
- pasted input-team simulations now run through direct Showdown battle-stream execution with random legal-choice bots
- seeded and imported top-meta simulations now also run through direct Showdown battle-stream execution whenever the stored snapshot includes full sets
- Victory Road imports now pull full OTS sets from both `vrpastes.com` and `pokepast.es` when available

## Phase 7: Recommendation Intelligence

Goal: make recommendations feel like expert VGC coaching rather than generic structural warnings.

Status: in progress

Tasks:

- rank recommendations by severity and practical impact instead of simple rule order
- detect coherent modes and broken modes across weather, terrain, Trick Room, speed-control packages, and support shells
- explain recommendations with evidence so the user can see which slots, types, or missing tools triggered the advice
- connect builder recommendations to active meta pressure so suggestions reflect real tournament threats rather than abstract team theory alone
- identify lead-pair strain, over-centralized support dependencies, tera-tax patterns, and mode collisions
- improve simulation follow-up recommendations so repeated losses map back to concrete builder or pilot changes
- eventually promote recommendations from plain strings into structured objects the UI can sort, filter, and group

Progress:

- the deterministic analysis engine now recognizes weather, terrain, and Trick Room cohesion more explicitly
- recommendation output is now ranked more intentionally instead of following a flat first-match rule order
- imported tournament snapshots now surface repeated pressure themes and mode-driven prep advice more clearly
- the next layer of work is lead synergy, speed-tier context, tera-pressure tracking, and meta-weighted prioritization

Execution Plan:

Backend work:

- add structured recommendation models with fields for severity, category, evidence, affected members, and suggested fixes while keeping string summaries available for lightweight UI surfaces
- expand heuristic inputs to include lead-pair synergy, speed-tier flags, item and ability redundancy, anti-priority tools, terrain blockers, and tera dependency
- add meta-weighting so active snapshot threats influence recommendation priority instead of only local team structure
- connect simulation loss patterns to builder recommendations so repeated failures can produce concrete change suggestions
- add confidence scoring and deduping so closely related recommendations collapse into a cleaner top set

Frontend work:

- redesign recommendation panels to group advice by priority, category, and confidence rather than a single flat bullet list
- show inline evidence under each recommendation so users can see why the app is making that call
- add compact tags for mode issues such as weather, terrain, Trick Room, speed control, support load, and tera tax
- allow team detail, analysis, meta, and testing views to share the same recommendation presentation language
- keep the surface concise by default, with expandable detail for deeper coaching notes

Competitive VGC heuristics to add:

- identify default leads, backup leads, and overloaded leads where too many matchups depend on one opening pair
- detect speed-control fragility, including one-point-of-failure Tailwind or Trick Room plans
- flag over-centralized support dependencies such as one redirection user, one Fake Out pivot, or one mandatory defensive tera
- track weather and terrain mirrors separately from generic mode presence
- detect teams that are structurally fine in a vacuum but underprepared for repeated snapshot pressure like Ground spread, priority denial, or pivot attrition
- surface pilot notes separately from builder notes so the app can tell the user whether the fix is to change the six or change the line

Validation and QA:

- add fixture teams that represent strong sun, rain, Trick Room, balance, and broken-mode shells
- write recommendation-order tests so the highest-priority issue stays stable as heuristics evolve
- add golden-path tests for imported meta snapshots and simulation follow-up recommendations
- review recommendation wording for UI clarity so the output reads like coaching instead of debug text
- use Docker test runs as the final verification path once the active environment has the full backend toolchain installed

## Immediate Next Steps

1. Keep polishing builder ergonomics around species/forms and slot editing flow.
2. Continue Phase 7 by adding lead-pair, speed-tier, tera-tax, and support-dependency heuristics to recommendation ranking.
3. Make recommendation output structured so the frontend can group advice by severity, category, and evidence.
4. Polish snapshot-management UX and extend web-ingestion helpers beyond Victory Road.
5. Add secondary Showdown-based trend ingestion only if it improves, not replaces, tournament snapshots.
6. Upgrade the battle bots from random legal-choice play to stronger scripted or search-based agents if simulation fidelity becomes the next priority.

## Last Updated Snapshot

- Current active milestone: Post-MVP Polish
- Last completed milestone: QA pass plus clean empty first-run team workspace
- Current progress: the full requested app loop is now live, including saved teams, Showdown import, analysis, stored snapshots, matchup planning, Showdown-backed validation, tournament-result ingestion, direct Showdown execution for both pasted and top-meta simulation runs when full sets are available, handoff-safe empty states, and the first pass of stronger recommendation intelligence around mode detection and prioritization
- Current next recommendation: treat recommendation quality as the main competitive-value upgrade path, with tournament snapshots remaining the primary meta source and further work focused on sharper, more explainable coaching output

## Notes

- Meta data should be snapshot-based and dated, not hardcoded as universally current.
- When move recommendations and suggested sets are added, Smogon should be used as the primary moveset reference source.
- Tournament results are a better primary source for automated meta snapshots than Showdown ladder data; Showdown should be treated as supplemental usage context.
- Recommendation quality should be judged by both web-app clarity and actual VGC usefulness: the best advice should be easy to scan in the UI and strong enough that an experienced player would consider acting on it.
- The current simulation lane is an MVP: queued, stored, and useful for workflow testing, but not yet battle-accurate in the way a full Pokemon Showdown engine integration would be.
- Showdown is now part of the runtime as a dedicated validation and packing service, which reduces risk when swapping the simulator core later.
- Direct Showdown battle execution is now in use for pasted input-team runs and for top-meta snapshot teams whenever a full stored set is available.
- Victory Road tournament imports now support both `vrpastes.com` and `pokepast.es` open-team-sheet links.
- This document is intended to stay concise and operational rather than become a design essay.
