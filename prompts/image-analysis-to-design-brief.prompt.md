# Image Analysis -> Design Brief Prompt

Use this prompt with a model that supports strong image analysis.

## Part 1: Context (only this part should be edited)

```text
We are building [APP_TYPE] for [TARGET_USER].
Primary jobs to be done: [JTBD_1], [JTBD_2], [JTBD_3].
Main route/screen to implement first: [ROUTE_OR_SCREEN].
```

## Part 2: Prompt Body

```text
You are a senior product designer and frontend design-systems architect.

Analyze the attached reference image and generate an implementation-ready design brief.

Return exactly two outputs in this order:

1) JSONC Design Brief
2) Developer Brief (Markdown)

The JSONC must include:
- meta: style_name, confidence_notes, inferred_layout_type
- visual_dna: mood, density, contrast_strategy, visual_hierarchy
- tokens:
  - color: bg, surface, surface_alt, border, text_primary, text_secondary, accent_primary, accent_secondary, success, warning, danger
  - typography: font_family_sans, font_family_display, scale (xs..display), weights
  - spacing: base_unit, scale
  - radius: sm, md, lg, xl, pill
  - shadow: subtle, medium, floating
  - motion: durations, easings, interaction_principles
- layout_system: canvas, max_width, grid_columns_desktop, grid_columns_mobile, gutters, section_spacing
- components: list of component specs with states and variants
- interaction_patterns: hover, focus, active, disabled, loading, empty, error
- responsive_rules: breakpoints and behavior changes
- dark_mode_rules: explicit token mapping and contrast handling
- accessibility: color-contrast targets, keyboard/focus, aria guidance
- implementation_rules:
  - no magic strings for design values
  - all colors/radius/spacing must come from tokens
  - reuse shared UI primitives
- anti_patterns: what to avoid

Color extraction requirements:
- Infer a dominant palette from the image and provide practical hex approximations.
- Distinguish neutral scale vs accent scale.
- Include both base and emphasis colors used for charts/status signals.

Developer Brief requirements:
- Summarize intended user experience.
- Explain screen composition and component priorities.
- Explain responsive strategy and dark mode behavior.
- Explain the minimum token set required to reproduce the style.
- Include a short "Implementation Checklist" section.

Keep output concrete and implementation-ready.
```

## Notes

- Keep the style extraction deterministic and reusable.
- Do not let the output depend on content copy in the reference image.
- Prioritize transferable design rules over one-off visuals.

