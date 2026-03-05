# Implementation Brief — Page 02 Security Overview

## Hard Constraints
- Reuse global shell and token set from this bucket.
- No hardcoded styling constants in page-level components.
- Use shared chart helpers for bars, lines, and donut segments.

## Required Widgets
1. Masthead and metadata row.
2. Toolbar with division/language/profile + utility actions.
3. Threat filter pills and period toggle.
4. Risk development chart (bar stacks) and trend line chart.
5. KPI cards with donut, trend sparkline, and incident sparkline.

## Required States
- Hover/focus/active states for pills/buttons.
- Loading placeholders for chart panels.
- Empty and error states for each chart card.

## Acceptance Criteria
- State changes (filters/toggles) update displayed chart data.
- Layout remains readable from 360px mobile to wide desktop.
- Chart and control interactions are keyboard operable.
- Color and type hierarchy visually matches the reference style family.
