# Implementation Brief — Page 04 Heatmap

## Hard Constraints
- Use shared dark-neon tokens; no independent palette.
- Implement matrix as semantic HTML grid/table to preserve accessibility.
- Data transformations (scores/intensity tiers) stay in JS helpers.

## Required Widgets
1. Threat selector and action buttons.
2. 5x5 heatmap matrix with axis labels and score values.
3. Hover/click details for matrix cells.
4. Three donut summary cards with category legends.

## Required States
- Hover/focus/active on cells and controls.
- Loading placeholders for matrix and donuts.
- Empty state when selected threat has no records.
- Error state with retry path.

## Acceptance Criteria
- Matrix updates when threat context changes.
- Heatmap remains interpretable on mobile.
- Keyboard users can traverse selectable cells.
- No hardcoded design values in feature components.
