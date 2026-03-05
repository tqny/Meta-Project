# Integration

## Local Preview
- Open `dashboard/security-suite/index.html` in the local server.
- All 5 reference-based pages are linked from that route.

## Install Into Another Project
Run:

```bash
python3 scripts/install-bucket.py --bucket saas-security-neon --target /ABSOLUTE/TARGET/PATH
```

This creates:
- `<target>/design-system/saas-security-neon/tokens.css`
- `<target>/design-system/saas-security-neon/bucket.json`
- `<target>/design-system/saas-security-neon/agent-context.md`
- `<target>/design-system/saas-security-neon/README.md`

## Apply Theme
1. Import the installed `tokens.css`.
2. Wrap root app node with `.theme-saas-security-neon`.
3. Use token vars in feature code and preserve bucket state patterns.
