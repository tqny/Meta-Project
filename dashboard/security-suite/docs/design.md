# Design Source Of Truth

## Purpose
This document translates the five reference images and the intake artifacts into one shared design target for the active five-page desktop application.

It exists to remove ambiguity before implementation:
- what the app should feel like
- which source-image patterns to adopt
- which current panels should compress, merge, or expand
- which data formats are semantically correct for each page

This document is the visual authority for the next builder passes.

## Reference Inputs

### Primary image-analysis artifacts
- `/Users/tqny/Documents/Meta Project/docs/design/intake/saas-security-neon-dark/page-01-table/`
- `/Users/tqny/Documents/Meta Project/docs/design/intake/saas-security-neon-dark/page-02-security-overview/`
- `/Users/tqny/Documents/Meta Project/docs/design/intake/saas-security-neon-dark/page-03-charts/`
- `/Users/tqny/Documents/Meta Project/docs/design/intake/saas-security-neon-dark/page-04-heatmap/`
- `/Users/tqny/Documents/Meta Project/docs/design/intake/saas-security-neon-dark/page-05-ui-elements/`

### Current implementation sources
- `/Users/tqny/Documents/Meta Project/dashboard/security-suite/assets/security-suite.css`
- `/Users/tqny/Documents/Meta Project/dashboard/security-suite/assets/security-suite.js`
- the five active HTML page templates under `/Users/tqny/Documents/Meta Project/dashboard/security-suite/`

### Current token source
- `/Users/tqny/Documents/Meta Project/design-system/saas-security-neon/tokens.css`

## Visual DNA

### Mood
- Analytical
- Controlled
- High-signal
- Internal-tool, not consumer-product
- Futuristic without becoming decorative noise

### Density
- Desktop-first medium-high to high density
- Compact controls and data surfaces
- Intentional negative space only around major surfaces and title framing

### Contrast Strategy
- Very dark neutral shell
- Slightly lighter nested surfaces
- Thin muted separators
- One dominant primary accent family with two supporting chart accents
- Status colors are softer and more luminous than standard admin red/yellow/green

### Visual Hierarchy
- Application frame first
- Page title and action cluster second
- Primary working surface third
- Secondary support surfaces last

The sources consistently favor one large hero surface and one support strip rather than many equally weighted cards.

## Shared Shell Target

### Frame
- Keep the centered rounded app shell.
- Increase the sense of a contained instrument panel rather than a generic web page.
- Outer background should feel atmospheric and directional, with bloom concentrated in one or two corners.

### Rail
- Keep the left rail as the primary navigation system.
- Make it feel more like a utility spine and less like a wide link list.
- The source images suggest narrower, more icon-led navigation with one active state carrying the eye.

### Global Navigation Rule
- Do not keep both the left rail and full-width page tabs in the long-term design.
- The left rail should remain the primary navigation layer.
- Secondary page tabs should be removed or drastically reduced during the shared-shell pass.

### Topbar
- The topbar should do three things only:
  - set page context
  - expose the most important controls
  - host a compact action cluster
- It should not duplicate navigation already handled by the rail.

## Typography Target

### Display
- Use the current display family direction (`Sora`-leaning) but make it more assertive.
- The overview page can carry the largest masthead treatment.
- Other pages should use more restrained but still intentional display titles.

### UI Text
- Retain a compact sans family (`Manrope`-leaning) for labels, tables, and meta text.
- Labels should remain short and operational.
- Avoid paragraph-heavy surfaces in the main workflow pages.

### Hierarchy Rules
- Large page title
- Small uppercase/meta kicker
- Compact card titles
- Very restrained supporting text
- Strong numeric hierarchy for key metrics

## Spacing And Surface Rules
- Prefer fewer, larger surfaces over more, smaller surfaces.
- Keep a tight rhythm inside utility panels.
- Table rows, pills, and controls should feel slightly denser than they do now.
- Card padding should not be uniform across all modules; hero surfaces can breathe more, utility surfaces should compress.

## Control System Target

### Inputs And Filters
- Filters should live in one compact horizontal band when possible.
- Dropdowns and search fields should feel more integrated and less form-like.
- Top controls should prioritize alignment and rhythm over equal width.

### Buttons
- Primary actions: violet accent fill
- Secondary actions: dark filled with bright border/label
- Ghost actions: rare; avoid overusing them as navigation substitutes

### Pills And Segments
- Source images use pills to control scope, period, or category.
- Prefer pills and segmented controls over tabs when the content changes within the same working surface.

## Table Grammar
- Tables remain the correct format for ranked operational work and vendor/domain pipelines.
- Rows should feel like command-center records, not plain HTML tables.
- Use more in-cell utility presentation:
  - status chips
  - compact gradient progress bars
  - clustered dot/pill signal summaries
  - denser cell alignment
- Add sorting/pagination only where it serves the operational task.

## Chart Grammar

Use charts only when they outperform text or tables.

Preferred chart language from the sources:
- grouped vertical capsule bars for time buckets
- multi-series wave or line trends on dark grids
- donut summaries for compact distribution snapshots
- small sparkline or mini-line cards for supporting trends
- stepped intensity matrices only when the data is genuinely two-axis risk

Avoid:
- flat generic bars where a line or capsule timeline would be clearer
- decorative charts whose insight is already obvious from a label
- introducing a literal heatmap just because one reference contains one

## Detail And Log Grammar
- Detail panels should be dense, calm, and utility-first.
- Lists and timelines remain the correct format for:
  - evidence
  - notes
  - registrar actions
  - enforcement updates
  - decision trace
- Large key-value grids should be reduced when they can be merged into denser metadata strips.

## Information Compression Rules
- Every page should have one primary surface.
- A page may have one secondary support strip or one secondary side panel.
- Avoid multiple equally important rows of summary cards before the main content.
- Do not create new tabs/pages for minor state differences.
- If a small section exists only to summarize the panel directly above it, merge it into that panel.

## Data-Viz Decision Rules

Use this mapping during implementation:

| Information Type | Preferred Format | Why |
| --- | --- | --- |
| ranked case/domain/vendor work | table | comparison and prioritization matter |
| record editing for selected item | docked side panel or compressed detail block | preserves workflow context |
| trend over time | capsule bars + line / line chart | reveals movement and timing |
| category distribution with few categories | donut or bar list | quick glance summary |
| status composition inside row | pills, chips, micro-bars | keeps comparison in-table |
| event history | timeline/list | preserves chronology clearly |
| 2-axis risk evaluation | matrix/heatmap | only when both axes are meaningful |

## Current Cross-Page Problems To Correct
- Duplicate navigation layers: left rail plus page tabs
- Too many ornamental KPI rows
- Card fragmentation that weakens the main surface
- Several pages not using the source-image “hero surface + support strip” composition
- Investigation page is under-charted relative to its intended role
- Domain and enforcement pages still inherit generic dashboard habits rather than the sharper source patterns

## Page-To-Source Mapping

### Operations Overview
- Primary source: `page-02-security-overview`
- Secondary source: `page-03-charts`
- Adoption focus:
  - strong masthead framing
  - integrated trend deck
  - bottom summary cards instead of stacked KPI rows

### Case Queue
- Primary source: `page-01-table`
- Adoption focus:
  - dense table rhythm
  - compact control band
  - stronger selected-row state
  - narrower utility-style detail panel

### Investigation
- Primary source: `page-03-charts`
- Secondary source: `page-05-ui-elements`
- Adoption focus:
  - chart-first primary surface
  - tighter case context band
  - utility-style action and evidence blocks

### Domain Portfolio
- Primary source: `page-01-table`
- Selective source: `page-04-heatmap`
- Secondary source: `page-05-ui-elements`
- Adoption focus:
  - keep table as the primary surface
  - borrow stepped risk language and compact utility styling
  - do not force a literal heatmap unless the model supports a real two-axis matrix

### Enforcement Tracker
- Primary source: `page-05-ui-elements`
- Secondary source: `page-01-table`
- Adoption focus:
  - compact utility controls
  - denser detail module
  - support panels that emphasize deadlines, workload, and outcomes over ornamental summaries

## Source Adoption Rules
Bring a source-image pattern into the app only if:
1. it materially improves visual convergence
2. it is semantically correct for the Brand Protection workflow
3. it reduces clutter or improves operator speed on desktop

## Anti-Patterns
- Generic dashboard card soup
- Page tabs that duplicate primary navigation
- More than one KPI row ahead of the main working surface
- Decorative charts with weak informational payoff
- Large empty cards holding only a sentence or two
- Copy blocks that wrap awkwardly inside dense utility panels
- Literal use of reference-image patterns when the data model does not support them

## Builder Acceptance Rubric
Any future implementation pass should be judged against:
- Closer to reference images
- Better operational clarity
- Better density without crowding
- Fewer redundant panels
- Stronger chart/table choice for the underlying information
- No drift from tokenized, reusable styling

## Next Design Dependency
The next builder pass should start with the shared shell and token language before page-specific rebuilding.
