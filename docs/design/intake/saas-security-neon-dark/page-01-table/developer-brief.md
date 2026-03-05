# Developer Brief — Page 01 Table

## Experience Goal
Provide a high-density operations table where analysts can filter quickly, compare issue mix, and scan response progress without leaving the page.

## Composition
- Left vertical utility rail remains persistent across all desktop pages.
- Main shell includes title row, filter row, and table card.
- Table columns: title, open-issue composition, type, replies/progress.
- Footer row provides compact pagination and page-size control.

## Interaction Priorities
- Fast filtering: search + division select update table instantly.
- Clear row state: hover and selected are visually distinct.
- Sorting controls on headers for at least title and replies.
- Loading/empty/error states are first-class, not afterthoughts.

## Responsive Strategy
- Desktop: full table layout with fixed headers.
- Tablet: maintain columns with horizontal scroll.
- Mobile: convert each row into stacked card cells with key-value labels.

## Accessibility
- Sort actions are keyboard accessible with `aria-sort` updates.
- Focus ring always visible on controls and row action targets.
- Keep color-only encoding paired with text values (percentages, labels).

## Implementation Checklist
- [ ] Shared tokens consumed (no local hardcoded styling values)
- [ ] Rail + top controls implemented with reusable primitives
- [ ] Sort/filter/pagination interactions wired
- [ ] Loading, empty, and error table states implemented
- [ ] Responsive behavior verified at desktop/tablet/mobile breakpoints
