# Repo Structure Audit

Date: 2026-03-06

Update:
- Legacy Firecrawl frontend was archived on branch `codex/archive-firecrawl-final` at commit `d33cb7a`.
- The Firecrawl working-tree files were then removed so `dashboard/security-suite/` is the only current frontend surface.
- `.playwright-cli` artifacts were untracked and ignored.
- The sections below preserve the original diagnosis that led to that cleanup.

## Purpose

Document where the workspace is genuinely mingled, what is merely shared infrastructure, and how to separate active vs legacy work without breaking the current `security-suite` build.

## Current Top-Level Layout

- `dashboard/security-suite/`
  - Active Speculo UI build
  - Current 5-page workflow plus 2 rollback pages
- `design-system/`
  - Active token source for `security-suite`
- `src/brandguard/`, `scripts/`, `tests/`
  - Backend simulation, artifact generation, utilities, and tests
- `docs/`
  - Mixed project docs, ADRs, metrics artifacts, design intake, worklog
- `.playwright-cli/`
  - Generated local browser artifacts now ignored

## Actual Mingling Problems

### 1. Two different frontend products share one `dashboard/` namespace

Observed:
- Active app lives at `dashboard/security-suite/`
- Older product surfaces still live directly under `dashboard/`
- `dashboard/security-suite/index.html` links back to `../index.html`, which is the older dashboard home

Why this is messy:
- The active build and legacy build read like one product tree even though they are now different UI systems
- It increases the chance of editing the wrong dashboard files

### 2. Design-system assets are split between root and dashboard-local mirrors

Observed:
- `design-system/saas-security-neon/` powers `security-suite`
- `design-system/firecrawl/` and `dashboard/legacy-firecrawl/design-system/firecrawl/` both exist for the older dashboard

Why this is messy:
- There are multiple token authorities depending on which frontend you are looking at
- The dashboard-local mirror blurs whether `dashboard/` is standalone or repo-root served

### 3. Root docs still center the older dashboard more than the active build

Observed:
- `README.md` initially presented the legacy dashboard as the main product surface
- `docs/design/primary-harvest-traceability.md` maps only the landing page and older dashboard/campaign lab
- `CHANGELOG.md` heavily documents the older dashboard evolution

Why this is messy:
- A new thread or builder can easily infer the wrong product as the current source of truth
- Repo-level docs do not clearly distinguish active, legacy, and historical tracks

### 4. Legacy rollback pages live inside the active app folder

Observed:
- `dashboard/security-suite/vendor-ops.html`
- `dashboard/security-suite/executive-reporting.html`

Why this is messy:
- They are intentionally preserved, but their presence inside the active app folder makes the route set look larger and less settled than it is
- This is manageable if explicitly labeled, but still contributes to ambiguity

### 5. Generated artifacts are mixed into source control hygiene

Observed:
- `.playwright-cli/` contains local automation logs, screenshots, and page captures
- Those files are currently tracked by git

Why this is messy:
- They add repo noise without contributing product source
- They increase the chance of accidental artifact commits on future work

## What Is Not Actually A Problem

- `src/brandguard/`, `scripts/`, `tests/`, and `docs/metrics/` are a different layer of the same project, not accidental clutter
- `dashboard/security-suite/docs/` is correctly scoped and should remain attached to the active app
- `design-system/compositions/` and `docs/design/intake/` are historical design input artifacts, not active UI source

## Recommended Separation Model

Short term:
- Treat `dashboard/security-suite/` as the only active frontend app
- Treat `dashboard/` root pages as legacy frontend surfaces
- Treat `.playwright-cli/` and similar captures as generated artifacts, not source

Medium term:
- Move old dashboard surfaces under an explicit legacy path
  - Example: `dashboard/legacy-firecrawl/` or `legacy/dashboard-firecrawl/`
- Keep active app entry points separate from historical demos
- Consolidate design-token ownership so each frontend points clearly at one source

Long term:
- Split the repo conceptually into:
  - active app
  - legacy app/demo surfaces
  - shared design assets
  - pipeline/backend/artifact tooling

## Recommended Cleanup Order

### Phase 1. Clarify without moving

- Add repo-level guidance naming `dashboard/security-suite/` as active and `dashboard/` root pages as legacy
- Ignore generated Playwright/browser artifacts
- Keep rollback pages in place but document them as non-active

### Phase 2. Separate legacy frontend paths

- Move the older dashboard bundle into an explicit legacy location
- Update links from root `index.html` and any docs that still reference those pages

### Phase 3. Repoint repo-level docs

- Update `README.md` so the active app is presented first
- Mark old dashboard paths as legacy/demo
- Split historical design traceability from current app docs if both need to remain

### Phase 4. Clean tracked artifacts from git history going forward

- Remove tracked `.playwright-cli/` files from the index in a dedicated cleanup change
- Keep ignore rules so new captures stay local

## Guardrails For Cleanup

- Do not move or refactor `dashboard/security-suite/` during initial cleanup
- Do not delete the older dashboard until links, docs, and any rollback needs are audited
- Do not merge the active `security-suite` docs into root docs without preserving active-vs-legacy distinctions

## Immediate Recommendation

The next safe cleanup pass should be:

1. Add ignore rules for generated artifacts
2. Add repo-level labeling of active vs legacy frontend surfaces
3. Plan the legacy dashboard move as a dedicated follow-up change

That sequence reduces confusion now without forcing a risky file move in the same pass
