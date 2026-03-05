# Implementation Brief — Page 01 Table

## Hard Constraints
- Use shared design tokens from the selected bucket only.
- No inline hex/rgb/hsl values in feature components.
- Keep page behavior data-driven (rows, filters, pagination from JS state).
- Reuse shell primitives used by other pages: rail, topbar, card, button, input, select.

## Required Widgets
1. Search input filtering by title/author.
2. Division multi/select filter.
3. Table with sortable columns.
4. Issue composition indicator (chip + segmented legend or dots).
5. Replies progress bars with numeric overlay.
6. Pagination controls and page-size select.

## Required States
- Hover/focus/active/disabled for controls and table rows.
- Loading skeleton rows.
- Empty result state when filters remove all rows.
- Error state with retry.

## Acceptance Criteria
- Desktop, tablet, and mobile layouts remain functional and readable.
- Keyboard navigation reaches every interactive element in order.
- Table updates without full page reload.
- Color contrast and focus indicators meet WCAG AA intent.
