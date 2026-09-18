# 🚍 Bus Operations Simulator

## Project Goal

Bus Operations Simulator is a realistic bus operations management and training system.

This is NOT a game.

The project models real operational processes used in a bus garage and is being built as a production-style full-stack portfolio application.

---

# Technology Stack

## Current

- React
- TypeScript
- Vite
- Git
- GitHub

## Planned

- Node.js
- REST API
- PostgreSQL / SQL
- Vitest
- React Testing Library
- Playwright
- Authentication / Authorization
- AI integration
- Docker
- GitHub Actions
- CI/CD
- Cloud deployment
- Application Security

---

# Development Workflow

Every feature follows:

TICKET
→ REQUIREMENTS
→ PLAN
→ BRANCH
→ IMPLEMENTATION
→ TEST
→ BUILD
→ CODE REVIEW
→ COMMIT
→ PUSH
→ MERGE TO MAIN
→ DELETE FEATURE BRANCH

Rule:

HUMAN UNDERSTANDS
→ AI ASSISTS
→ HUMAN REVIEWS
→ SOFTWARE VALIDATES
→ HUMAN APPROVES

Never keep code in the project that cannot be explained.

---

# Current Git State

Current development branch:

`feature/duties`

Previous feature:

`feature/rota-allocation-data`

Status:

COMPLETED → MERGED INTO MAIN → PUSHED → BRANCH DELETED

---

# Routes

Business order:

1. 421
2. 458
3. 512
4. 603
5. 684
6. 731
7. 447
8. 576
9. 655
10. 782

Each route contains:

- 4 Early drivers
- 4 Middle drivers
- 4 Late drivers

Therefore:

12 line drivers per route.

10 routes × 12 = 120 line drivers.

Additionally:

40 Spare drivers.

TOTAL:

160 drivers.

---

# Rolling Rota

Four rota weeks:

Week 1

- SAT Rest
- SUN Rest

Week 2

- SUN Rest
- MON Rest

Week 3

- TUE Rest
- WED Rest

Week 4

- THU Rest
- FRI Rest

Rolling sequence:

1 → 2 → 3 → 4 → 1

Weekly boundary:

Friday 23:59
→
Saturday 00:00

The base `rotaWeek` stored on a driver is not rewritten every week.

The current rota week is calculated from:

- base rota week
- rota start date
- current date

---

# Duty Number Allocation

Each route contains:

- 20 Early duties
- 20 Middle duties
- 20 Late duties

TOTAL:

60 duties per route.

Across 10 routes:

600 duties.

Duty number ranges:

421 → 1–60
458 → 61–120
512 → 121–180
603 → 181–240
684 → 241–300
731 → 301–360
447 → 361–420
576 → 421–480
655 → 481–540
782 → 541–600

Example for Route 421:

Early → 1–20
Middle → 21–40
Late → 41–60

Duty numbers are generated deterministically.

They are NOT random.

---

# Weekly Rota Allocation

COMPLETED.

Pipeline:

drivers.ts
→ getDriversForRota()
→ generateRouteAllocation()
→ getCurrentRotaWeek()
→ generateWeeklyRota()
→ generateFullWeeklyRota()
→ generateWeeklySnapshot()
→ generateWeeklyRotaPdf()

Weekly PDF contains:

- Route
- Week Commencing
- Pay Number
- Driver Name
- SAT
- SUN
- MON
- TUE
- WED
- THU
- FRI

Each route has separate:

- EARLY
- MIDDLE
- LATE

tables.

One route per PDF page.

---

# Weekly Rota PDF Archive

COMPLETED at frontend/business-logic level.

Rules:

Every Saturday at 00:00:

previous CURRENT
→ ARCHIVED

new weekly rota
→ CURRENT

Retention:

1 CURRENT document

- maximum 52 ARCHIVED documents

Maximum documents represented by the system:

53

When archive exceeds 52:

oldest archived document is removed.

Current frontend implementation manages document metadata in memory.

Actual PDF persistence and physical file deletion will be implemented later in the Node.js backend.

Planned storage:

storage/weekly-rotas/current/
storage/weekly-rotas/archive/

Future PostgreSQL metadata will contain fields such as:

- id
- week_commencing
- generated_at
- pdf_path
- status

---

# FEATURE — DUTIES

STATUS:

IN PROGRESS

Branch:

`feature/duties`

## Duty Model

Created:

`src/types/duty.ts`

Current Duty contract:

- dutyNumber
- route
- rota
- signOn
- signOff

A Duty represents an actual piece of work.

Example concept:

Duty 1
Route 421
Early
Sign On 04:00
Sign Off later in the day

The Weekly Rota assigns a Duty Number to a driver.

The Duties system defines what that Duty Number actually means.

---

# Duty Time Ranges

Created:

`src/data/dutyTimeRanges.ts`

Business rules:

EARLY
Sign-on range:
04:00–07:00

MIDDLE
Sign-on range:
10:00–13:00

LATE
Sign-on range:
15:00–17:00

Each rota contains 20 duties.

The 20 sign-on times will be distributed evenly across the configured time range.

Times must NOT be manually hardcoded for 600 duties.

---

# NEXT TASK

Create:

`src/utils/generateSignOnTime.ts`

Purpose:

Generate deterministic sign-on times from:

- rota type
- position of the duty
- configured time range
- total number of duties

Example concept:

421 Early:

20 duties distributed between:

04:00
and
07:00

The generator calculates the times.

It must NOT contain 20 manually entered times.

After implementation:

TEST
→ BUILD
→ continue Duties feature.

---

# Future — Daily Sign-On Sheet

PLANNED.

The Sign-On Sheet will be generated for the current operational day.

At the beginning of each day the system will combine:

Rolling Rota

- Duty definitions
- Driver allocation
- Current date

to create the daily Sign-On Sheet.

Fields will include:

- Sign-On Time
- Duty Number
- Employee Number
- First Name
- Last Name
- Sign-On Status

Conceptual flow:

ROLLING ROTA
→ TODAY'S DRIVER ALLOCATION
→ DUTY DATA
→ DAILY SIGN-ON SHEET
→ OPERATIONS BOARD

---

# Live Sign-On Alerts

PLANNED.

The Sign-On Sheet will compare the current time against each driver's sign-on time.

Concept:

More than 10 minutes remaining
→ normal

10 minutes or less
→ warning

5 minutes or less
→ urgent

Sign-on time passed without confirmation
→ LATE FOR SIGN-ON

Later the controller will be able to mark the driver as:

SIGNED ON

Once signed on, lateness warnings stop.

Exact UI colours and thresholds can be refined during implementation.

---

# Planned Frontend Modules

- Drivers
- Duties
- Vehicles
- Allocation
- Operations Board
- Incidents
- Reports
- Admin

Current priority:

DUTIES

Then the operational modules will progressively consume the same shared data.

---

# Backend Phase

After the frontend operational model is sufficiently complete:

React + TypeScript
→ HTTP
→ Node.js REST API
→ PostgreSQL
→ Node.js API
→ React State
→ UI

Planned API areas:

/drivers
/routes
/duties
/vehicles
/incidents
/availability

Static frontend mock data will progressively move into PostgreSQL.

---

# Production Phase

After full-stack integration:

- automated testing
- authentication
- authorization
- Controller / Driver / Admin roles
- protected routes
- validation
- rate limiting
- AI Operations Assistant
- Docker
- CI/CD
- deployment
- logging
- monitoring
- secrets management
- OWASP / application security

---

# AI Operations Assistant

Future operational flow:

DRIVER REPORTED SICK
→ AI INTERPRETS EVENT
→ SOFTWARE CHECKS ROTA / DUTIES / HOURS / AVAILABILITY
→ AI PRESENTS OPTIONS
→ CONTROLLER MAKES DECISION

Core rule:

AI ANALYSES
→ SOFTWARE VALIDATES
→ HUMAN DECIDES

AI must not independently make safety-critical operational decisions.

---

# Current Development Checkpoint

Current feature:

DUTIES

Completed in this feature:

- Duty TypeScript interface
- Duty time-range configuration

Next:

`generateSignOnTime.ts`

Then:

- test sign-on generation
- generate Duty objects
- test Duty generation
- Duties UI
- build
- Git commit/push
- merge feature to main
- delete feature branch

After that, continue according to the operational roadmap.

---

# Career Development Roadmap

Primary target:

Junior Software Engineer / Junior Full Stack Developer.

Primary market:

Poland — Kraków / Rzeszów / suitable remote roles.

Learning progression:

JavaScript / React
→ TypeScript
→ Node.js
→ REST API
→ PostgreSQL / SQL
→ Testing
→ Authentication / Security
→ AI Integration
→ Docker / CI/CD
→ Deployment

Bus Operations Simulator is the main project used to learn and demonstrate this complete engineering path.

Target:

Full project readiness around April/May 2027.

The project should be understandable, testable, deployable and explainable — not merely visually impressive.
