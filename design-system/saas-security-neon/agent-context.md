# Agent Context: SaaS Security Neon Dark

## Bucket
- ID: `saas-security-neon`
- Name: SaaS Security Neon Dark
- Style family: `dark-neon-ops`

## Usage Rules
- Import `tokens.css` and apply `.theme-saas-security-neon` to your app root.
- Use token variables for all design primitives (color, spacing, radius, shadow, motion, type).
- Do not hardcode visual constants in feature modules.
- Keep business/data logic unchanged unless explicitly requested.

## Core UI Traits
- Persistent utility rail and card-first dashboard modules.
- Dense but readable controls for operations workflows.
- Neon accent palette reserved for state emphasis and charts.
- Loading/empty/error states required for core widgets.

## Accessibility Baseline
- WCAG AA text/interactive contrast.
- Visible focus state on all interactive controls.
- Semantic tables and labelled form controls.
- Keyboard-operable filtering, pagination, toggles, and expandable rows.

## Build Checklist
- [ ] Root wrapped with `.theme-saas-security-neon`
- [ ] No hardcoded hex/radius/spacing values in feature CSS
- [ ] Desktop/tablet/mobile responsive behavior validated
- [ ] Hover/focus/active/loading/empty/error states implemented
