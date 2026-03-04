#!/usr/bin/env bash
set -euo pipefail

TODAY="$(date +%F)"
WORKLOG="docs/worklog/${TODAY}.md"

required_paths=(
  "README.md"
  "CHANGELOG.md"
  "docs/adr/0000-template.md"
  "docs/demos/DEMO_LOG_TEMPLATE.md"
  "docs/metrics/WEEKLY_METRICS_TEMPLATE.md"
  "docs/postmortems/TEMPLATE.md"
  ".github/PULL_REQUEST_TEMPLATE.md"
  "scripts/check-evidence.sh"
)

errors=0

for path in "${required_paths[@]}"; do
  if [[ ! -e "$path" ]]; then
    echo "[FAIL] Missing required path: $path"
    errors=$((errors + 1))
  fi
done

if ! grep -q "^## \[Unreleased\]" CHANGELOG.md; then
  echo "[FAIL] CHANGELOG.md is missing required [Unreleased] section"
  errors=$((errors + 1))
fi

if [[ ! -f "$WORKLOG" ]]; then
  echo "[FAIL] Missing today's worklog: $WORKLOG"
  errors=$((errors + 1))
fi

if [[ $errors -gt 0 ]]; then
  echo "Evidence check failed with $errors issue(s)."
  exit 1
fi

echo "Evidence check passed."
