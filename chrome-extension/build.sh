#!/bin/bash
# Builds the production zip for Chrome Web Store submission.
# Usage: cd chrome-extension && ./build.sh
set -euo pipefail

VERSION=$(node -e "console.log(require('./manifest.json').version)")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"
ZIP_NAME="launchory-extension-v${VERSION}.zip"

# Files that make up the actual extension — everything else in this
# folder (store-assets/, build.sh, README.md, this dist output) is
# packaging/documentation and must not ship inside the extension zip.
FILES=(
  manifest.json
  content.js
  popup.html
  popup.js
  background.js
  icons
)

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

for f in "${FILES[@]}"; do
  cp -r "$SCRIPT_DIR/$f" "$DIST_DIR/"
done

cd "$DIST_DIR"
rm -f "../$ZIP_NAME"
zip -r "../$ZIP_NAME" . -x "*.DS_Store"
cd "$SCRIPT_DIR"

echo "Built $ZIP_NAME from dist/ — upload this file to the Chrome Web Store Developer Dashboard."
