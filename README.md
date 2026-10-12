# ContextBridge

**Cross-context developmental intelligence for pediatric therapy**

ContextBridge is a full-stack prototype that explores a simple but important problem in pediatric therapy:

> A child may appear to be improving in structured therapy sessions while still struggling to use the same skill independently at home, school, or with peers.

Most progress dashboards answer:

**“Is the child improving?”**

ContextBridge adds a second question:

**“Is that improvement actually generalizing across real-world contexts?”**

---

## Live Demo

**Live app:** https://contextbridge-production-abe0.up.railway.app/ 
**GitHub:** `https://github.com/mrigakshi-chib/contextbridge`  


---

## Why I built this

A therapist may see strong progress in a clinic setting, while caregivers or teachers observe very different performance elsewhere.

For example, the same developmental skill may look like:

- strong independence in therapy
- similar performance at home
- much lower independence at school
- very limited spontaneous use with peers

If everything is reduced to one overall progress percentage, those differences can disappear.

ContextBridge combines repeated observations across environments, people, activities, and prompt levels to make that gap visible.

---

## Core idea

ContextBridge separates two related but different signals:

### Skill acquisition

Is the child becoming more independent with the target skill over time?

### Real-world generalization

Is that independence transferring across:

- clinic
- home
- school
- caregivers
- therapists
- teachers
- peers
- structured and unstructured activities

A child can therefore show:

> **Improving skill acquisition**

while still showing:

> **Uneven real-world generalization**

That distinction is the central idea behind the project.

---

## Demo scenario

The current synthetic demo follows a child named **Aarav** working toward the developmental goal:

> **Independent two-word requesting**

The synthetic dataset is designed to show:

- increasing independence over time
- decreasing prompt dependency
- stronger performance in some environments
- weaker performance at school
- weaker performance during peer interaction

All data in this project is synthetic.

No real child or patient information is used.

---

## What ContextBridge does

ContextBridge currently supports:

- therapist-entered observations
- caregiver-entered observations
- AI-assisted caregiver note extraction
- editable human review before saving
- backdated observations
- future-date prevention
- live PostgreSQL persistence
- weekly progress tracking
- prompt-dependency tracking
- performance by environment
- performance by communication partner
- performance by activity
- cross-context generalization-gap detection
- evidence counts for each context
- longitudinal progress visualization
- automatic dashboard recalculation after every saved observation

---

## Therapist dashboard

The main dashboard gives a therapist a cross-context view of the same developmental goal.

It includes:

- **Overall success**
- **Independent success**
- **Cross-context gap**
- **Skill acquisition vs real-world generalization**
- **Performance by environment**
- **Performance by communication partner**
- **Activity-level patterns**
- **Progress over time**
- **Prompt dependency**
- **Observation counts supporting each metric**

This helps distinguish overall improvement from real-world transfer.

---

## Evidence-aware analytics

One of the main design decisions in ContextBridge is to avoid making strong conclusions from sparse data.

### Weekly trends

Observations are grouped into seven-day periods.

A week currently needs at least:

```text
3 observations
```

before it contributes to higher-level longitudinal conclusions.

Weeks with fewer observations are still shown, but marked:

> **Early data**

This prevents one unusually strong or weak observation from being treated as representative of an entire week.

### Generalization

Cross-context conclusions also require repeated observations within a context.

A single weak school observation should not automatically become evidence that the skill does not generalize to school.

The current thresholds are prototype product heuristics, not clinically validated standards.

---

## Therapist observation workflow

Therapists can add structured observations through:

```text
/observations/new
```

The form captures:

- observation date
- environment
- communication partner
- activity
- prompt level
- attempts
- successful responses
- independent responses
- optional notes

Once saved:

```text
Observation
    ↓
PostgreSQL / Neon
    ↓
Analytics recalculated
    ↓
Dashboard updates
```

---

## Caregiver AI workflow

Caregivers can describe what happened naturally instead of filling a structured form.

Example:

> During breakfast at home, Aarav asked his mother for juice twice by himself.

Gemini converts the note into structured fields such as:

- environment
- partner
- activity
- prompt level
- attempts
- successful responses
- independent responses
- short neutral summary

The caregiver must review and confirm the extracted information before it is saved.

---

## Human-in-the-loop AI

AI output is never written directly into the developmental record.

The flow is:

```text
Natural-language note
        ↓
Gemini extraction
        ↓
Editable structured draft
        ↓
Human review
        ↓
Confirm & save
        ↓
Database
```

If information is missing, the system is instructed to avoid guessing and can ask for clarification instead.

Gemini is used only to reduce caregiver input friction.

It does **not**:

- diagnose
- recommend treatment
- prescribe interventions
- choose therapy goals
- replace therapist judgment

---

## Observation dates and late entry

Both therapist and caregiver workflows include an explicit observation date.

Users can enter:

- today
- any earlier date

Future dates are blocked.

This means a missed observation can be entered later and still be assigned to the correct historical week.

For example:

```text
Observed: October 8
Entered:  October 12
```

The analytics still treat it as an October 8 observation.

---

## Progress over time

Weekly analytics track:

- independent success
- overall success
- prompt dependency
- observation count

The dashboard includes a line chart showing:

- **Independent success rising**
- **Prompt dependency falling**

Only sufficiently observed weeks are included in the main trend chart.

Sparse recent weeks remain visible underneath as early data.

---

## Generalization gap

ContextBridge compares independent performance across repeatedly observed environments.

It identifies:

- strongest environment
- weakest environment
- percentage-point difference between them
- whether the difference crosses the prototype threshold

Example:

```text
Home:   58%
School: 22%

Cross-context gap: 36 points
```

The purpose is not to diagnose a deficit.

It is to surface a pattern that may deserve closer therapist attention.

---

## Analytics

The core analytics live in:

```text
lib/analytics.ts
```

They include:

### Overall progress

Calculates:

- attempts
- successes
- independent successes
- success rate
- independent success rate

### Grouped performance

Aggregates by:

- environment
- partner
- activity

Each group includes:

- independent success rate
- success rate
- observation count

### Prompt dependency

Calculated as:

```text
(attempts - independent successes)
---------------------------------- × 100
             attempts
```

### Weekly trend

Observations are:

1. sorted chronologically
2. grouped into seven-day periods
3. aggregated within each period
4. labelled with observation count
5. filtered for reliable higher-level trend interpretation

### Generalization gap

The system:

1. groups observations by environment
2. filters out under-sampled contexts
3. finds the strongest context
4. finds the weakest context
5. calculates the percentage-point gap

---

## Architecture

```text
                     ContextBridge
                          |
            ---------------------------
            |                         |
      Therapist input           Caregiver input
            |                         |
     Structured form          Natural-language note
            |                         |
            |                   Gemini extraction
            |                         |
            |                    Human review
            |                         |
            -------- Confirmed observation
                          |
                          v
                  PostgreSQL / Neon
                          |
                          v
                Deterministic analytics
                          |
          ----------------------------------
          |               |                |
    Weekly trends     Context gaps     Partner/activity
                                          patterns
          |
          v
                 Therapist dashboard
```

---

## Tech stack

### Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Recharts

### Backend

- Next.js Server Actions
- Prisma ORM

### Database

- PostgreSQL
- Neon

### AI

- Google Gemini Developer API
- `@google/genai`

### Deployment

- Railway

---

## Project structure

```text
contextbridge/
│
├── app/
│   ├── components/
│   │   └── ProgressTrendChart.tsx
│   │
│   ├── observations/
│   │   └── new/
│   │       ├── ObservationDateField.tsx
│   │       ├── actions.ts
│   │       └── page.tsx
│   │
│   ├── parent/
│   │   └── observation/
│   │       ├── actions.ts
│   │       └── page.tsx
│   │
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── lib/
│   ├── analytics.ts
│   └── prisma.ts
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── scripts/
│   └── check-analytics.ts
│
├── public/
├── prisma7.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

# Installation

## Prerequisites

Make sure you have:

- Node.js
- npm
- Git

You will also need:

- a PostgreSQL database
- a Gemini API key

The current project uses Neon PostgreSQL.

---

## 1. Clone the repository

```bash
git clone https://github.com/mrigakshi-chib/contextbridge
```

Then:

```bash
cd contextbridge
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Create environment variables

Create a file named:

```text
.env
```

in the project root.

Add:

```env
DATABASE_URL="YOUR_POSTGRESQL_CONNECTION_STRING"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

Do not commit `.env`.

---

## 4. Generate Prisma client

```bash
npx prisma generate
```

---

## 5. Apply database migrations

For a fresh database:

```bash
npx prisma migrate deploy
```

For local schema development:

```bash
npx prisma migrate dev
```

---

## 6. Seed the synthetic demo data

```bash
npx prisma db seed
```

This creates the synthetic child, active developmental goal, and longitudinal observation data used by the dashboard.

---

## 7. Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Main routes

### Therapist dashboard

```text
/
```

### Add therapist observation

```text
/observations/new
```

### Caregiver AI observation

```text
/parent/observation
```

---

## Optional: inspect the database

```bash
npx prisma studio
```

This opens Prisma Studio for:

- Child
- Goal
- Observation

---

## TypeScript check

```bash
npx tsc --noEmit
```

---

## Production build

```bash
npm run build
```

---

## Analytics check

```bash
npx tsx scripts/check-analytics.ts
```

---

# Deployment

The project is designed to deploy on Vercel.

## 1. Push the project to GitHub

```bash
git add .
git commit -m "Prepare ContextBridge for deployment"
git push
```

## 2. Import the repository into Vercel

Sign in to Vercel with GitHub and import the ContextBridge repository.

Vercel should automatically detect Next.js.

## 3. Add environment variables

Add:

```text
DATABASE_URL
GEMINI_API_KEY
```

Use the same values as your local environment.

Do not upload `.env`.

## 4. Deploy

Use the default build command:

```bash
npm run build
```

## 5. Verify production

Check:

```text
/
```

```text
/observations/new
```

```text
/parent/observation
```

Confirm that:

- database data loads
- chart renders
- therapist observations save
- caregiver extraction works
- confirmed caregiver observations save
- dates work
- future dates are blocked
- dashboard metrics recalculate
- no runtime errors appear

---

## Important engineering decisions

### Deterministic analytics

The dashboard metrics are calculated from TypeScript functions rather than generated by an LLM.

### Human-reviewed AI

Gemini structures caregiver notes, but a human confirms the result before storage.

### Sparse-data protection

Under-sampled weeks and contexts remain visible without being overinterpreted.

### Backdated observations

Historical observations can be added later without corrupting the timeline.

### Server-side validation

Important constraints are checked on the server even if the browser already restricts them.

### Synthetic-only data

The prototype does not use real patient information.

---

## Reliability handling

The Gemini integration includes basic error handling.

### Temporary 503 errors

The system retries once.

### 429 quota exhaustion

The system stops retrying and returns a readable message.

This prevents repeated calls when the daily API quota is exhausted.

---

## Current limitations

ContextBridge is a proof-of-concept, not a production clinical platform.

Current limitations include:

- one synthetic child
- one active developmental goal
- no authentication
- no role-based access control
- no full observation-history screen
- no edit/delete workflow
- no audit trail
- no teacher-specific input flow
- no EHR integration
- no clinical validation
- no healthcare compliance layer
- one primary structured observation extracted from each caregiver note
- no statistical confidence intervals
- prototype-level evidence thresholds

The thresholds used in the demo are product-design heuristics and are not clinically validated.

---

## Future scope

Possible next steps include:

- multiple children
- multiple developmental goals
- therapist and caregiver accounts
- teacher-facing input
- observation history
- editing and deletion with audit logs
- context-specific trend charts
- generalization-gap trends over time
- richer prompt-fading analysis
- configurable evidence thresholds
- multiple observations extracted from one caregiver note
- alerts for persistent context gaps
- therapist drill-down views
- multi-goal comparison
- production privacy and compliance controls

One especially interesting extension would be tracking whether the **generalization gap itself shrinks over time**.

For example:

```text
Week 1: 45-point gap
Week 4: 30-point gap
Week 8: 15-point gap
```

That could become a useful longitudinal signal alongside skill acquisition.

---

## Product principles

ContextBridge was built around a few principles:

### Acquisition is not generalization

Improvement in therapy does not automatically mean the skill transfers to daily life.

### Context matters

Performance can change depending on where, with whom, and during what activity the skill is expected.

### Do not overinterpret sparse data

One observation should not define an entire week or environment.

### AI should reduce friction

AI is useful when it makes caregiver participation easier.

### AI should remain assistive

It should not silently become the clinician.

### Humans stay in control

Caregivers review AI-generated structure before saving.

### Analytics should be inspectable

Important metrics should be reproducible and understandable.

---

## Possible LISSUN / Sunshine direction

ContextBridge was built around the broader challenge of maintaining continuity across:

```text
clinic
home
school
```

Potential integration directions could include:

- surfacing context-specific carryover gaps
- connecting caregiver observations with therapist progress views
- identifying prompt dependence outside structured therapy
- comparing therapist, caregiver, and teacher contexts
- tracking whether skills generalize over time
- reducing caregiver documentation friction through natural-language input

This prototype explores that product direction and does not claim knowledge of private or internal LISSUN / Sunshine systems.

---


## Author

**Mrigakshi Chib**

Software / Product Engineering

GitHub: `https://github.com/mrigakshi-chib`  
LinkedIn: `www.linkedin.com/in/mrigakshi-chib`

---

## Disclaimer

ContextBridge is an exploratory software prototype built using synthetic data.

It is **not a medical device** and is not intended to:

- diagnose developmental conditions
- provide medical advice
- prescribe treatment
- recommend therapy
- replace qualified therapists or healthcare professionals

The analytics thresholds and interpretation rules used in this prototype are product-design choices for demonstration purposes and have not been clinically validated.