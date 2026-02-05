#!/usr/bin/env bash
set -euo pipefail

# Downloads Linear Grotesk font files into public/fonts/linear-grotesk.
# You must provide a base URL that hosts the font files.
# Example:
#   FONT_BASE_URL="https://example.com/fonts/linear-grotesk" \
#   ./scripts/fetch_linear_grotesk_fonts.sh

if [[ -z "${FONT_BASE_URL:-}" ]]; then
  echo "ERROR: FONT_BASE_URL is required." >&2
  echo "Example: FONT_BASE_URL=\"https://example.com/fonts/linear-grotesk\" $0" >&2
  exit 1
fi

TARGET_DIR="public/fonts/linear-grotesk"
mkdir -p "$TARGET_DIR"

declare -a FILES=(
  "LinearGrotesk-Light.woff2"
  "LinearGrotesk-Regular.woff2"
  "LinearGrotesk-Medium.woff2"
  "LinearGrotesk-Semibold.woff2"
  "LinearGrotesk-Bold.woff2"
  "LinearGrotesk-Extrabold.woff2"
)

for file in "${FILES[@]}"; do
  url="${FONT_BASE_URL%/}/$file"
  echo "Downloading $url"
  curl -fsSL "$url" -o "$TARGET_DIR/$file"
done

echo "Fonts downloaded to $TARGET_DIR"
