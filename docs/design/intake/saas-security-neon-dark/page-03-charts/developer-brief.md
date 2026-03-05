# Developer Brief — Page 03 Charts

## Experience Goal
Give analysts a chart-first screen for trend detection: fast switching between risk dimensions with clear supporting score snapshots.

## Composition
- Page title and top-right actions.
- Unified chart container containing filter pills, period selector, stacked timeline bars, and wave trend chart.
- Bottom row of three score cards (donut + two mini line charts).

## Interaction Priorities
- Filter pills and period toggle re-bind chart datasets.
- Chart hover reveals date/value details.
- Line legend can mute/unmute individual series.

## Responsive Strategy
- Desktop: wide chart area with aligned controls.
- Tablet: controls wrap, charts remain in one column.
- Mobile: chart wrappers scroll horizontally while preserving labels.

## Accessibility
- Preserve textual values near/within chart cards.
- Legend buttons should be keyboard focusable and announce state.

## Implementation Checklist
- [ ] Interactive filters and period controls wired
- [ ] Stacked timeline + wave chart implemented
- [ ] Mini score cards implemented
- [ ] Loading/empty/error states per chart card
- [ ] Responsive behavior and keyboard interactions validated
