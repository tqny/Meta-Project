# Agent Handoff

## Objective
Implement UI with a unified visual identity while borrowing best-fit interaction structures from other buckets.

## Visual Source Of Truth
- Primary bucket: `firecrawl`
- Use only primary bucket tokens for color, type, spacing, radius, elevation, and background language.

## Borrowed Patterns
- activity_timeline: borrow from idea-04 using Notes composer; keep only behavior/structure.
- kpi_cards: borrow from idea-02 using KPI cards; keep only behavior/structure.
- filter_bar: borrow from idea-02 using Bar chart panel, Transactions table; keep only behavior/structure.
- cta_actions: borrow from idea-05 using Top nav, Primary CTA; keep only behavior/structure.

## Constraints
- Keep business logic and data-flow untouched.
- No hardcoded colors/radius/shadows in feature components.
- Preserve accessibility and responsiveness.
- Document every borrowed pattern and source in PR evidence.
