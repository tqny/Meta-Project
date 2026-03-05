# PageAI Reference Prompts (Extracted Pattern)

These are preserved in hub form so you can stay aligned with the tutorial pattern.

## 1) Image -> Design Brief Prompt (reference format)

```text
Your task is to create a detailed UI implementation specification from a visual reference for this app:

[YOUR APP DETAILS]

Please analyze the attached screenshot and output:

1) **A complete JSONC design brief** with:
- color palette (semantic + exact values)
- typography scale
- spacing, radii, shadows
- component specs and states
- layout rules and responsive behavior
- interaction/motion guidelines
- accessibility notes
- implementation constraints

2) **A concise developer brief** summarizing what to build.

Important:
- Extract colors from the screenshot contextually (do not guess random palettes).
- Keep output implementation-ready and unambiguous.
```

## 2) Codegen Prompt Skeleton (reference format)

```text
Build this route based on the provided brief and design spec.

Requirements:
- responsive layout
- dark mode support
- maintainable modular code
- no magic strings for core styling values
- centralized design tokens

Implementation Brief:
[PASTE_DEVELOPER_BRIEF]

Design Specification (JSONC):
[PASTE_JSONC_DESIGN_BRIEF]
```

## Hub Rule

In this hub, only the context block is edited per project. The rest of the prompt structure stays stable.

