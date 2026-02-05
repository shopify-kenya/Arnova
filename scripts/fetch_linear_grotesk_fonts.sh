#!/usr/bin/env bash
set -euo pipefail

# Downloads Linear Grotesk font files into public/fonts/linear-grotesk.
# Provide either:
#   1) FONT_BASE_URL pointing to individual .woff2 files, or
#   2) FONT_ZIP_URL pointing to a zip archive containing the fonts.
#
# Examples:
#   FONT_BASE_URL="https://example.com/fonts/linear-grotesk" \
#   ./scripts/fetch_linear_grotesk_fonts.sh
#
#   FONT_ZIP_URL="https://example.com/linear-grotesk.zip" \
#   ./scripts/fetch_linear_grotesk_fonts.sh

if [[ -z "${FONT_BASE_URL:-}" && -z "${FONT_ZIP_URL:-}" ]]; then
  echo "ERROR: Provide FONT_BASE_URL or FONT_ZIP_URL." >&2
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

if [[ -n "${FONT_ZIP_URL:-}" ]]; then
  tmp_dir="$(mktemp -d)"
  zip_path="$tmp_dir/linear-grotesk.zip"
  unzip_dir="$tmp_dir/unpacked"
  mkdir -p "$unzip_dir"

  echo "Downloading zip from $FONT_ZIP_URL"
  curl -fsSL "$FONT_ZIP_URL" -o "$zip_path"

  echo "Extracting fonts..."
  unzip -q "$zip_path" -d "$unzip_dir"

  missing=()
  for file in "${FILES[@]}"; do
    found_path="$(find "$unzip_dir" -type f -iname "$file" | head -n 1 || true)"
    if [[ -z "$found_path" ]]; then
      missing+=("$file")
      continue
    fi
    echo "Copying $file"
    cp "$found_path" "$TARGET_DIR/$file"
  done

  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "WARNING: Missing files in zip:" >&2
    for file in "${missing[@]}"; do
      echo "  - $file" >&2
    done
    echo "Zip contents:" >&2
    find "$unzip_dir" -type f | sed 's#^.*/##' | sort >&2
    exit 1
  fi
else
  for file in "${FILES[@]}"; do
    url="${FONT_BASE_URL%/}/$file"
    echo "Downloading $url"
    curl -fsSL "$url" -o "$TARGET_DIR/$file"
  done
fi

echo "Fonts downloaded to $TARGET_DIR"
