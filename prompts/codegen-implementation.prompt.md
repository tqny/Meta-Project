# Code Generation Prompt Template

Use this after creating `design-criteria.jsonc` and `developer-brief.md`.

## Part 1: Context (only this part should be edited)

```text
Build a [APP_TYPE] route for [PRODUCT_NAME] focused on [GOAL].
Target users: [TARGET_USER].
Primary route: [ROUTE_OR_SCREEN].
```

## Part 2: Prompt Body

```text
Implement the requested UI using the attached Implementation Brief and JSONC Design Specification.

Hard requirements:
- Fully responsive (mobile, tablet, desktop)
- Dark mode support with consistent hierarchy
- No magic strings for design values (colors, spacing, radius, shadows, durations)
- Design tokens must be centralized and reused
- Use existing UI primitives; avoid duplicating primitive behavior
- Keep code maintainable and modular

Deliverables:
- Route/page implementation
- Any required token/config updates
- Reusable components for repeated UI patterns
- Minimal sample data structures for previews

Quality checks:
- No hard-coded hex values in feature components
- Keyboard focus states visible and accessible
- Empty/loading/error states covered for key widgets
- Visual hierarchy matches brief

Implementation Brief:
[PASTE_IMPLEMENTATION_BRIEF]

JSONC Design Specification:
[PASTE_JSONC_DESIGN_SPEC]
```

