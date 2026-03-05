# Developer Brief — Page 02 Security Overview

## Experience Goal
Present an executive security command view that combines fast context (title + controls) with interpretable risk trajectories and KPI mini-panels.

## Composition
- Large masthead title and top control row.
- Primary chart card for risk development over time.
- Secondary analytics row with donut and two line cards.
- Shared shell/rail should match all other site pages.

## Interaction Priorities
- Filter tabs switch displayed threat/risk series.
- Period toggle updates timeline granularity (days/weeks/months).
- Chart hover shows contextual tooltips.

## Responsive Strategy
- Desktop: full-width timeline and 3 mini-cards.
- Tablet: timeline stays full width, mini-cards become 2+1 stack.
- Mobile: all cards stack single column with scroll-safe charts.

## Accessibility
- Keep heading hierarchy strict (`h1` page title, `h2` card titles).
- Chart panels provide text summary for screen readers.
- Controls have explicit labels; avoid icon-only without accessible names.

## Implementation Checklist
- [ ] Masthead + toolbar implemented
- [ ] Timeline bars + trend chart interactive
- [ ] Mini analytics cards (donut/line/incidents)
- [ ] Period and threat filters wired to chart state
- [ ] Responsive layout validated on three breakpoints
