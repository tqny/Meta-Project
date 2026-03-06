# Panel Audit

Audit labels:
- `keep`
- `restyle`
- `restructure`
- `replace`
- `merge`

Priority scale:
- `high`
- `medium`
- `low`

## Cross-Page Findings

### Global decisions
- Left rail stays. It is the correct primary navigation model for the desktop app.
- Full-width page tabs should be removed or reduced during the shared-shell pass. They duplicate the rail and flatten the hierarchy.
- Back links in topbars should be de-emphasized or removed if the rail remains sufficient.
- The app currently overuses KPI rows. Most operational pages should not lead with a full row of summary cards before the main surface.
- The source images consistently favor one hero work surface plus one support strip. The current build often breaks content into too many similar cards.

### Cross-page component status

| Pattern | Decision | Priority | Notes |
| --- | --- | --- | --- |
| left rail | `restyle` | high | Keep the navigation model but make it narrower and more instrument-like. |
| topbar | `restructure` | high | Remove redundant navigation and compress controls/actions into clearer utility rows. |
| page tabs | `merge` | high | Fold this responsibility back into the rail; do not keep both. |
| KPI rows | `merge` | high | Reserve for overview or fold into richer primary surfaces on operational pages. |
| generic cards | `restructure` | high | Surfaces need stronger hierarchy and less equal-weight fragmentation. |
| tables | `restyle` | high | Correct base type, but current treatment is too generic relative to the source. |
| detail side panels | `restructure` | high | Correct pattern, but current density and composition are weak. |
| list/timeline blocks | `keep` | medium | Right semantic choice; visual treatment should tighten. |
| bar-list summaries | `replace` | medium | Useful only when comparison is primary; several current uses are placeholders for stronger chart/card forms. |

## Page 1. Operations Overview

### Summary
This page currently communicates the right topics but in the wrong composition. It behaves like a generic summary dashboard instead of the source-image executive command view.

### Audit

| Panel | Current Role | Source Analog | Decision | Priority | Notes |
| --- | --- | --- | --- | --- | --- |
| page chrome (shell, rail, topbar) | global frame | page-02, page-03 | `restructure` | high | Keep the shell but remove duplicate page tabs and strengthen the masthead/action framing. |
| overview controls (range pills) | view scope control | page-02 period controls | `restyle` | medium | Correct interaction type; needs tighter placement and stronger integration with the hero chart deck. |
| KPI rows (6 metrics total) | top-level summary | page-02/page-05 support cards | `merge` | high | Two full KPI rows are too much. Compress into one support strip or fold metrics into the lower analytic cards. |
| threat volume chart | trend summary | page-03 chart deck | `replace` | high | Current single chart is too thin. Replace with a richer integrated trend deck using grouped capsule bars plus trend line language. |
| threats by channel | distribution | page-03 bottom cards | `replace` | medium | Bar list is serviceable but not visually aligned. Use a compact distribution card, likely donut or tighter bar card depending label fit. |
| threats by type | distribution | page-03 bottom cards | `replace` | medium | Same issue as channel card; current format is too plain and too large for the insight. |
| executive summary | narrative summary | page-02 framing card | `restyle` | medium | Keep the content idea but reduce prose and make it feel like a briefing panel. |
| watchlist | active issues needing attention | page-05 utility list | `merge` | medium | Merge into the executive summary / briefing card instead of giving it independent card weight. |

### Consolidation Direction
- Target one hero analytics surface plus one bottom support strip of three compact cards.
- Do not keep two KPI rows plus two secondary cards plus a text card.

## Page 2. Threat Intake & Case Queue

### Summary
This page already uses the correct primary format. The main work is density, shell alignment, and reducing ornamental summary elements so the table becomes the dominant surface.

### Audit

| Panel | Current Role | Source Analog | Decision | Priority | Notes |
| --- | --- | --- | --- | --- | --- |
| page chrome (shell, rail, topbar) | global frame | page-01 table shell | `restructure` | high | Remove full page tabs and make the topbar feel more like a compact control/action deck. |
| filter/search bar | queue controls | page-01 top filters | `restyle` | high | Correct structure, but controls should be denser and more visually integrated. |
| KPI row | queue summary | page-05 utility cards | `merge` | high | Low-value ahead of the primary table. Fold into title meta or table footer summary unless a metric is directly actionable. |
| case table | primary work surface | page-01 table | `restructure` | high | Keep the table, but increase density, improve header affordance, and introduce more source-like in-cell signal treatments. |
| selected-case actions panel | detail/edit surface | page-05 utility detail block | `restructure` | high | Correct pattern, but too roomy and equal in weight to the table. Needs to become a narrower, denser utility panel. |
| recent notes in side panel | case history | page-05 utility lists | `keep` | low | Correct semantic format; tighten styling only. |

### Consolidation Direction
- Make the table visually dominant.
- Compress the action panel.
- Add pagination/sort affordances only if they support the queue workflow; do not add decorative controls.

## Page 3. Case Investigation View

### Summary
This is the page furthest from its source-image analog. It is supposed to be chart-first and explanation-rich, but it currently reads as stacked text cards with no strong hero analytical surface.

### Audit

| Panel | Current Role | Source Analog | Decision | Priority | Notes |
| --- | --- | --- | --- | --- | --- |
| page chrome (shell, rail, topbar) | global frame | page-03 charts shell | `restructure` | high | Top controls should feel more like a compact utility strip and less like a repeated page template. |
| case selector/meta strip | record context | page-05 top utility row | `restyle` | medium | Keep as the selection mechanism, but compress and align it more tightly with page actions. |
| case information grid | structured case metadata | page-05 detail module | `merge` | high | Too much grid weight for metadata alone. Merge into a denser context panel with asset info. |
| domain / asset context | supporting metadata | page-05 detail module | `merge` | high | Combine with case information into one compact context block. |
| AI assist panel | explanation and next action | custom within source language | `restructure` | high | Keep the concept, but make it feel like an operational decision module, not a text card. |
| evidence links | attached evidence | page-05 list pattern | `keep` | medium | Correct format; should likely live in a tighter lower support strip. |
| enforcement activity | downstream coordination snapshot | page-05 list pattern | `keep` | medium | Correct format, but should visually relate to action controls and timeline. |
| case timeline | decision trace | page-03 primary chart region | `replace` | high | Timeline-only presentation underuses the source. Replace with a richer “decision explanation / signal over time” hero surface that still preserves chronology. |
| action buttons | operator actions | page-03/page-05 control clusters | `restyle` | medium | Right actions, wrong presentation. Integrate more tightly with AI assist and case context. |
| missing primary signal deck | explain why the system flagged the case | page-03 chart deck | `replace` | high | This page needs a new primary analytical surface showing signal mix, activation/risk movement, or event chronology in chart form. |

### Consolidation Direction
- Merge metadata blocks.
- Introduce one hero chart/explanation surface.
- Keep evidence and enforcement as supporting utility modules, not equal peers with the hero surface.

## Page 4. Domain Portfolio Dashboard

### Summary
The page uses the correct primary format today: a table plus detail panel. The main design challenge is to borrow useful heatmap-page visual language without forcing a literal heatmap where it is not semantically justified.

### Audit

| Panel | Current Role | Source Analog | Decision | Priority | Notes |
| --- | --- | --- | --- | --- | --- |
| page chrome (shell, rail, topbar) | global frame | page-04 heatmap shell | `restructure` | high | Keep the shell pattern but remove duplicated navigation and make the header more tool-like. |
| search/filter bar | portfolio controls | page-04 top controls | `restyle` | medium | Correct role; needs tighter rhythm and clearer alignment. |
| KPI row | portfolio summary | page-05 utility cards | `merge` | high | These metrics are not strong enough to precede the main table. Fold them into a compact support strip or detail summary. |
| domain table | primary work surface | page-01 table | `restyle` | high | Keep the table. Improve density, in-cell signal treatment, and row hierarchy. |
| domain detail block | selected record context | page-05 detail block | `restructure` | high | Correct pattern, but it should become denser and more layered. |
| risk flags section | state summary | page-04 stepped risk language | `merge` | medium | Keep the content but integrate it into the detail header or a tighter summary cluster. |
| linked cases | cross-object linkage | page-05 list pattern | `restyle` | low | Correct format. Keep, but compress. |
| registrar action log | operational updates | page-05 list/timeline pattern | `keep` | low | Correct format; mostly styling and density work. |
| literal heatmap matrix | risk matrix visualization | page-04 heatmap | `keep` (not added) | medium | Do not add a literal 5x5 heatmap unless a real likelihood x consequence model is introduced for domains. |

### Consolidation Direction
- Keep the primary table + detail split.
- Borrow heatmap-page visual language for stepped risk treatment, not necessarily the exact matrix component.

## Page 5. Enforcement & Vendor Tracker

### Summary
This page has the right core structure but one weak supporting panel. It should feel more like a dense coordination console and less like a table plus leftover chart.

### Audit

| Panel | Current Role | Source Analog | Decision | Priority | Notes |
| --- | --- | --- | --- | --- | --- |
| page chrome (shell, rail, topbar) | global frame | page-05 UI elements shell | `restructure` | high | Same cross-page issue: duplicated tabs, generic topbar rhythm. |
| vendor/status filters | top controls | page-05 utility controls | `restyle` | medium | Right control set; needs denser, more source-aligned presentation. |
| KPI row | enforcement summary | page-05 utility cards | `merge` | high | Open/breach/resolved counts are useful but should not sit as a full summary row above the core pipeline. |
| enforcement pipeline table | primary work surface | page-01 table + page-05 utility balance | `restyle` | high | Keep the table. Improve SLA visualization, row density, and selected-row hierarchy. |
| selected action panel | detail/edit surface | page-05 detail block | `restructure` | high | Correct pattern but should feel tighter and more like a coordination module. |
| action notes | coordination history | page-05 list/timeline pattern | `keep` | low | Correct semantic format. |
| action type distribution | supporting summary | page-03 small-card chart language | `replace` | high | Lowest-value panel on the page. Replace with something more operationally useful such as deadlines, vendor workload, breach trend, or outcome mix. |

### Consolidation Direction
- Keep the table and detail pairing.
- Replace the bottom distribution card with a more operational support module.

## Recommended Builder Sequence After Audit
1. Shared shell and topbar cleanup
2. Shared control/table/detail-panel convergence
3. Queue page
4. Investigation page
5. Domain page
6. Enforcement page
7. Overview page
