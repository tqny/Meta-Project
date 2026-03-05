# Primary Bucket + Borrowed Pattern Prompt

Use this prompt with project-specific agents when applying a design outfit to an existing app/dashboard.

## Prompt Template

```text
You are implementing UI for this project route: [ROUTE_OR_SURFACE].

Primary visual source of truth:
- Bucket: [PRIMARY_BUCKET_ID]
- Files:
  - /design-system/[PRIMARY_BUCKET_ID]/bucket.json
  - /design-system/[PRIMARY_BUCKET_ID]/tokens.css
  - /design-system/[PRIMARY_BUCKET_ID]/agent-context.md

Composition traceability source:
- /compositions/[COMPOSITION_ID]/composition-spec.json

Execution rules:
1) Use [PRIMARY_BUCKET_ID] for all tokens (colors, spacing, typography, radius, shadows, background language).
2) Borrow only structure and interaction patterns from mapped source buckets in composition-spec.
3) Do not copy non-primary visual primitives from borrowed buckets.
4) Re-skin every borrowed pattern with [PRIMARY_BUCKET_ID] tokens so the UI is visually unified.
5) Keep existing business logic and data contracts untouched.
6) Maintain responsiveness and keyboard accessibility.
7) Add a short traceability note listing which patterns were borrowed and from which buckets.

Return:
- Files changed
- Which borrowed patterns were implemented
- What remained unavailable/TBD
- Tests/checks run
```
