#!/bin/zsh
set -euo pipefail

ROOT="/Users/tqny/Documents/Meta Project"
PORT="${1:-4186}"

echo "Serving Meta Project root for security-suite"
echo "Root: $ROOT"
echo "URL:  http://127.0.0.1:${PORT}/dashboard/security-suite/security-overview.html"
echo "Map:  http://127.0.0.1:${PORT}/dashboard/security-suite/index.html"

python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$ROOT"
