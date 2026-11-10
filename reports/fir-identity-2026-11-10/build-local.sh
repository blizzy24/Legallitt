#!/usr/bin/env bash
set -euo pipefail
export EXPO_PUBLIC_DATA_SOURCE=api
export EXPO_PUBLIC_API_URL=http://127.0.0.1:3003
export EXPO_PUBLIC_LOCAL_API_PROXY=0
pnpm --filter @legalitt/mobile exec expo export --platform web --output-dir dist/fir-verification
export VITE_API_BASE_URL=http://127.0.0.1:3003
pnpm --filter @legalitt/admin exec vite build --outDir dist/fir-verification
