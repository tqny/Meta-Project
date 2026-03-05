# Firecrawl Outfit (firecrawl)

This folder is a portable design bucket for reuse in external projects.

## Files

- `bucket.json`: Full machine-readable design bucket
- `tokens.css`: Theme-scoped CSS variables under `.theme-firecrawl`
- `agent-context.md`: Prompting instructions for project agents

## Use in a project

1. Import `tokens.css`.
2. Wrap your app root with class ``.theme-firecrawl``.
3. Feed `bucket.json` + `agent-context.md` to your implementation agent.
