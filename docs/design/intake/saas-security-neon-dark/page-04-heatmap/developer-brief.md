# Developer Brief — Page 04 Heatmap

## Experience Goal
Make risk prioritization explicit through a consequence-vs-likelihood heatmap where users can inspect hotspots and compare treatment outcomes over time.

## Composition
- Title and top actions.
- Threat selector above main matrix card.
- 5x5 heatmap with axis labels and score labels.
- Lower summary section with three donut cards (threats, risks, residual risks).

## Interaction Priorities
- Selecting a threat updates matrix values and donut summaries.
- Hovering matrix cells reveals bucket details.
- Optional click-to-pin a selected heatmap cell for deeper context.

## Responsive Strategy
- Desktop: full matrix and three donuts in row.
- Tablet: matrix full width, donuts in wrapped grid.
- Mobile: matrix in horizontal scroll container, donuts stacked.

## Accessibility
- Heatmap cells need both numeric text and color cues.
- Axis labels must remain visible in mobile scroll mode.

## Implementation Checklist
- [ ] Threat selector wired to matrix/donut data
- [ ] Interactive 5x5 heatmap with tooltips
- [ ] Donut trio with legends
- [ ] Loading/empty/error for matrix and summary cards
- [ ] Mobile-safe matrix rendering with preserved labels
