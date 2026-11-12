#!/usr/bin/env bash
# Deploy the Netlify Next.js adapter output, not Next.js's internal .next directory.
set -euo pipefail

usage() {
  echo "Usage: NETLIFY_SITE_ID=<site-id> bash scripts/deploy-netlify.sh preview|production" >&2
}

if [[ $# -ne 1 || ( "$1" != "preview" && "$1" != "production" ) ]]; then
  usage
  exit 64
fi

: "${NETLIFY_SITE_ID:?Set NETLIFY_SITE_ID to the intended Netlify site ID}"
command -v netlify >/dev/null || { echo "Netlify CLI is required." >&2; exit 69; }

cd "$(dirname "$0")/.."

if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  echo "Refusing to deploy: commit tracked changes before building." >&2
  exit 1
fi

if find . -maxdepth 1 -type f -name '.env*' ! -name '.env.example' -print -quit | grep -q .; then
  echo "Refusing deployment: local dotenv files may be bundled. Use a clean checkout." >&2
  exit 1
fi

publish=".netlify/static"
functions=".netlify/functions-internal"

if [[ ! -d "$publish/_next/static" || ! -f "$publish/logos/rice-kottu-hut-logo.png" ]]; then
  echo "Missing Netlify adapter static output or restaurant logo. Run netlify build first." >&2
  exit 1
fi

if [[ ! -f "$functions/___netlify-server-handler/___netlify-server-handler.mjs" ]]; then
  echo "Missing Netlify adapter serverless handler. Run netlify build first." >&2
  exit 1
fi

css_count="$(find "$publish/_next/static" -type f -name '*.css' | wc -l | tr -d ' ')"
if [[ "$css_count" -lt 1 ]]; then
  echo "Missing Next.js stylesheets in Netlify static output." >&2
  exit 1
fi

if find "$publish" "$functions" -type f -name '.env*' -print -quit | grep -q .; then
  echo "Refusing deployment: dotenv file detected in deployment artifacts." >&2
  exit 1
fi

sha="$(git rev-parse --short HEAD)"
args=(--no-build --dir "$publish" --functions "$functions" --site "$NETLIFY_SITE_ID"
  --message "Startek Restaurant POS $sha; static assets and serverless adapter")
if [[ "$1" == "production" ]]; then
  args+=(--prod)
fi

echo "Deploying release $sha to the Netlify site explicitly selected by NETLIFY_SITE_ID."
echo "Static assets: $publish ($css_count CSS files); backend: $functions"
netlify deploy "${args[@]}"
