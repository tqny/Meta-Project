# Implementation Brief — Page 03 Charts

## Hard Constraints
- Use shared shell and tokens only.
- Implement chart interactions with lightweight SVG/CSS/JS (no opaque black-box libs required).
- Keep chart datasets in JS modules so they can be swapped with real data later.

## Required Widgets
1. Threat filter pill group.
2. Period segmented control.
3. Stacked bar timeline with tooltip.
4. Multi-series line/wave chart with legend toggles.
5. Three summary cards (donut + 2 trend charts).

## Required States
- Hover/focus/active for controls and legend toggles.
- Loading/empty/error states for main chart and summary cards.

## Acceptance Criteria
- Changing filters updates both primary charts and summary card numbers.
- Main charts remain legible at common breakpoints.
- Keyboard navigation and focus feedback are intact.
- No feature-level hardcoded design values.
