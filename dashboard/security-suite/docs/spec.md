# Brand Protection Control Center (Demo)

## Purpose
Build a desktop-first learning and demonstration dashboard that simulates the core workflow of a Program Manager handling brand protection, domain enforcement, and off-platform threat operations.

The product should do two things well:

1. Teach the workflow clearly enough that a reviewer can understand how threats are identified, triaged, investigated, enforced, and reported.
2. Demonstrate strong AI-assisted product-building and dashboard implementation quality through a polished, maintainable interface.

## Target User
Internal brand protection / integrity program manager.

## Primary Outcomes
- Show the end-to-end workflow across five pages without marketing language.
- Use simulated data that feels operationally credible.
- Converge visually toward the provided SaaS security reference images.
- Present data in the most useful format for the task, not by habit.
- Reduce unnecessary fragmentation so the product feels efficient on desktop.

## Active MVP Scope
Single-user demo application with simulated data only.

Active pages:
1. Operations Overview
2. Threat Intake & Case Queue
3. Case Investigation View
4. Domain Portfolio Dashboard
5. Enforcement & Vendor Tracker

## Non-Goals
- Real enforcement or registrar integrations
- Authentication or permissions systems
- Real legal workflows
- Large-scale ingestion pipelines
- Framework rewrites or new app bootstrapping

## Current Functional Model
The current MVP centers on five objects:
- `Case`
- `Evidence`
- `Domain`
- `Vendor`
- `EnforcementAction`

The current workflow lifecycle is:

`New -> Triaged -> Investigating -> Enforcement -> Closed`

## Quality Bar
- Keep this build separate from other dashboard experiments in the repo.
- Preserve operational clarity while improving the visual system.
- Keep styling tokenized and reusable.
- Treat the reference images as visual authority.
- Keep desktop as the primary target for the current phase.

## Success Criteria
- The workflow is immediately legible to a hiring manager or recruiter.
- The dashboard looks materially closer to the source images than the current state.
- Each page uses the right information pattern for the job.
- Redundant or weak panels are reduced, merged, or replaced.
- Shared shell, typography, controls, and chart grammar feel coherent across all five pages.
