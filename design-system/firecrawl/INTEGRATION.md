# Integration

Installed bucket: Firecrawl Outfit (firecrawl)

## HTML/CSS

1. Include `tokens.css`.
2. Add class ``.theme-firecrawl`` to your app root element.

## React/Next

- Import `design-system/firecrawl/tokens.css` in your root layout.
- Wrap root with className="theme-firecrawl".
- Feed `bucket.json` + `agent-context.md` to UI generation agents.

## Tailwind

Reference CSS vars in custom theme extension, for example:

`colors: { appBg: 'var(--dh-color-bg)', appAccent: 'var(--dh-color-accent-primary)' }`
