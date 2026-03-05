# Composition Plan: firecrawl-speculo-brandguard-operations-console-for-predictive-domain-abuse-enforcement-case-q-202603041455

## Primary Source Of Truth

- Bucket: `firecrawl` (Firecrawl Outfit)
- Source files:
  - `ideas/firecrawl/design-criteria.jsonc`
  - `ideas/firecrawl/developer-brief.md`
  - `ideas/firecrawl/implementation-brief.md`
- Visual authority: tokens, spacing scale, typography scale, radius/shadows, and background language.

## Project Context

Speculo (BrandGuard) operations console for predictive domain abuse enforcement: case queue triage, case detail explainability, lifecycle transitions with audit history, vendor capacity board, campaign board, executive summary, threshold tuning evidence panel; responsive desktop/mobile; preserve existing local JSON payload and interaction logic.

## Required UI Patterns

- `activity_timeline`: Show sequence and context for recent system/user events.
- `kpi_cards`: Expose top-line numbers before deeper exploration.
- `filter_bar`: Allow fast segmentation so users can narrow relevant slices of data.
- `cta_actions`: Drive clear primary and secondary user actions.

## Borrowed Pattern Traceability

| Pattern | Borrowed From | Structure Borrowed | Interaction Borrowed | Re-skin Rule |
|---|---|---|---|---|
| activity_timeline | idea-04 | Notes composer | loading | Re-skin with firecrawl tokens only. |
| kpi_cards | idea-02 | KPI cards | Unavailable | Re-skin with firecrawl tokens only. |
| filter_bar | idea-02 | Bar chart panel, Transactions table | Unavailable | Re-skin with firecrawl tokens only. |
| cta_actions | idea-05 | Top nav, Primary CTA | empty | Re-skin with firecrawl tokens only. |

## Unavailable Gaps

- None

## Non-Negotiables

- Extract only structure and interaction patterns from non-primary buckets.
- Do not import non-primary colors, radius, shadows, or typography values.
- Re-skin all borrowed patterns using primary bucket tokens.
- Keep existing business/data logic untouched.
- Record borrowed pattern provenance in implementation PR notes.

## Suggested Agent Prompt

```text
Use `firecrawl` as visual source of truth (tokens, spacing, typography, background).
Borrow only structure/interaction patterns per `composition-spec.json`.
Do not copy color, radius, shadow, or font tokens from borrowed buckets.
Re-skin every borrowed pattern with `firecrawl` tokens.
Do not change existing business logic, data contracts, or API behavior.
Track each borrowed pattern with source bucket in implementation notes.
```

Generated assets:
- `/Users/tqny/Documents/Project Design/design-hub/compositions/firecrawl-speculo-brandguard-operations-console-for-predictive-domain-abuse-enforcement-case-q-202603041455/composition-spec.json`
- `/Users/tqny/Documents/Project Design/design-hub/compositions/firecrawl-speculo-brandguard-operations-console-for-predictive-domain-abuse-enforcement-case-q-202603041455/composition-report.md`
- `/Users/tqny/Documents/Project Design/design-hub/compositions/firecrawl-speculo-brandguard-operations-console-for-predictive-domain-abuse-enforcement-case-q-202603041455/agent-handoff.md`
