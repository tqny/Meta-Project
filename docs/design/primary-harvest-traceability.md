# Primary + Harvest Traceability

- Date: 2026-03-04
- Project name: Speculo (BrandGuard prototype)
- Route/surface updated:
  - `/index.html` (landing page)
  - `/dashboard/index.html` (operations dashboard)
  - `/dashboard/campaigns.html` (campaign lab)
- Primary bucket: `firecrawl` (`design-system/firecrawl`)
- Composition source: `design-system/compositions/firecrawl-speculo-brandguard-operations-console-for-predictive-domain-abuse-enforcement-case-q-202603041455`

## Primary Token Authority

- `design-system/firecrawl/tokens.css` is the visual source of truth for:
  - color
  - spacing
  - typography
  - radius
  - shadows
  - background language
- Root class applied: `.theme-firecrawl` on dashboard `<body>`.

## Borrowed Pattern Map (Structure/Interaction Only)

| Pattern | Source Bucket | What Was Applied In Speculo | Visual Token Borrowing |
|---|---|---|---|
| `cta_actions` | `idea-05` (Expedition Editorial Travel) | Landing + dashboard + campaign pages use text-led nav and primary CTA framing to drive clear next actions. | None (Firecrawl tokens only) |
| `kpi_cards` | `idea-02` (Lime Fintech Operations) | Operations dashboard KPI strip reframed around domain-abuse response metrics and stage pressure indicators. | None (Firecrawl tokens only) |
| `filter_bar` | `idea-02` (Lime Fintech Operations) | Queue and campaign board use compact filter bars (stage tabs/search and keyword/min-domain controls). | None (Firecrawl tokens only) |
| `tables` | `idea-02` (Lime Fintech Operations) | Rebuilt execution queue and campaign board as operations tables with row selection driving console actions. | None (Firecrawl tokens only) |
| `tabs` | `idea-03` (Pastel Orders) | Segmented stage filters and threshold terminal tabs provide low-friction workflow switching. | None (Firecrawl tokens only) |
| `activity_timeline` | `idea-04` (Tactical Service Planner) | Case Console activity feed supports audit events + operator notes with timeline ordering. | None (Firecrawl tokens only) |

## Unavailable / TBD

- Unavailable: none from composition output.
- TBD:
  - Optional extension: persist reimagined stage transitions/notes to dedicated case-event artifacts.
  - Optional extension: add scenario compare mode (baseline vs candidate runs) in Campaign Lab.

## Business Logic / Data Integrity

- API/data contracts: input payload contract unchanged (`dashboard/data/product-v1.json`).
- Business behavior: intentionally reimagined for product goals:
  - New operator workflow stage model (`Detect`, `Validate`, `Enforce`, `Monitor`, `Closed`).
  - New autopilot policy behavior for stage movement based on risk posture.
  - Campaign Lab adds campaign-level status actions (`Escalation Requested`, `Monitor`, `Contained`) and strategy memo generation.
- Scoring/recommendation model artifacts from backend remain available and are interpreted by the new frontend behavior.
