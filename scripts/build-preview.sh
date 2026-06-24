#!/usr/bin/env bash
# Rebuild the shareable customer preview bundle (customer-preview/ + the .zip).
# Regenerates the two static exports and reassembles the folder. The landing
# page and admin demo (customer-preview/index.html and
# customer-preview/admin/index.html) are hand-written sources and are NOT touched.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

echo "-> building v2 export (/v2)..."
( cd pathos-v2 && rm -rf out && BASE_PATH=/v2 EXPORT=1 npm run build >/dev/null )
echo "-> building v3 export (/v3)..."
( cd pathos-v3 && rm -rf out && BASE_PATH=/v3 EXPORT=1 npm run build >/dev/null )

echo "-> assembling customer-preview/ ..."
rm -rf customer-preview/original customer-preview/v2 customer-preview/v3 customer-preview/admin/pathos-store.js
mkdir -p customer-preview/original customer-preview/admin
cp "prototypes/PATHOS by Yeralis.html" customer-preview/original/index.html
cp prototypes/pathos-store.js prototypes/image-slot.js customer-preview/original/
cp prototypes/pathos-store.js customer-preview/admin/
cp -r pathos-v2/out customer-preview/v2
cp -r pathos-v3/out customer-preview/v3

echo "-> zipping..."
rm -f customer-preview.zip
zip -qr customer-preview.zip customer-preview
echo "OK -> customer-preview/ and customer-preview.zip"
