# Agent Context: Firecrawl Outfit

## Bucket

- ID: `firecrawl`
- Name: Firecrawl Outfit
- Style family: light-saas-orange
- Best for: SaaS marketing sites, developer product pages, dashboard shell themes

## Rules

- Use only theme variables from `tokens.css` for colors, radius, shadows, spacing, and type scale.
- Do not hardcode hex values in feature components.
- Keep component behavior aligned to this bucket's interaction model.
- Preserve responsive and accessibility requirements from `bucket.json`.

## Developer Brief

# Firecrawl Outfit Developer Brief

## Experience Goal
Deliver a clean, conversion-focused SaaS page that feels technical and trustworthy. The design should read as product-first: clear hero promise, tangible feature proof, transparent pricing, and immediate activation CTA.

## Composition Priorities
1. Sticky top nav with one strong primary CTA.
2. Hero value proposition with interactive code/output tab preview.
3. Feature proof section with compact cards/snippets.
4. Pricing selector (monthly/yearly) with one highlighted plan.
5. FAQ accordion and final CTA strip.

## Visual Rules
- Light-first, neutral-heavy interface.
- Orange is the only dominant accent.
- Thin borders, rounded cards, restrained shadows.
- Use dark code blocks only where product/output needs contrast.

## Responsive Strategy
- Desktop: spacious sections with clear reading rhythm.
- Tablet: hero stacks; feature and pricing grids reduce columns.
- Mobile: single-column cards, preserved CTA prominence, readable tap targets.

## Dark Mode Behavior
Not required for first implementation. If added later, preserve orange emphasis and ensure AA contrast.

## Minimum Token Set
- color: neutrals + orange accent + semantic status colors
- typography: technical sans + display scale
- spacing: 4-based scale with large section spacing
- radius/shadow/motion: subtle and consistent

## Implementation Checklist
- [ ] Hero tabs switch real content (not cosmetic)
- [ ] Feature cards and pricing plans are data-driven
- [ ] FAQ accordion is keyboard accessible
- [ ] No hardcoded hex/radius/spacing values in feature components
- [ ] CTA interactions provide clear feedback states

## Implementation Brief

# Firecrawl Outfit Implementation Brief

## Context Block (edit per project)

```text
Project: [PROJECT_NAME]
Route: [ROUTE]
Domain: [DOMAIN]
Primary user outcome: [OUTCOME]
```

## Build Instructions
Apply the "Firecrawl Outfit" style using `design-criteria.jsonc`.

Required:
- Light-first responsive layout
- Strong orange-accent hierarchy
- Interactive hero code tabs, pricing toggle, and FAQ accordion
- Reusable sections/components and centralized tokens
- No magic strings for styling primitives

## Required Sections
- Sticky top navigation with primary action
- Hero headline + code/result tabs
- Feature grid (cards/snippets/metrics)
- Pricing cards with monthly/yearly switch
- FAQ accordion
- Final CTA strip

## Engineering Constraints
- Keep all theme values tokenized.
- Keep section data in configurable objects.
- Ensure accessible tab/accordion semantics.
- Preserve business logic/data flow from host project.

## Done Criteria
- Visual style clearly matches Firecrawl-like outfit
- Interaction model works across breakpoints
- Accessibility and focus states present
- Style can be reused in other projects via bucket install
