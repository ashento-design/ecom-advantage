# Launchory Chrome Extension

Analyze any AliExpress product instantly with Launchory AI — without leaving the page.

## What it does

- **On AliExpress product pages** (`aliexpress.com/item/...`), a floating "🚀 Analyze with Launchory" button appears in the bottom-right corner. Clicking it opens `launchory.io/analyze` in a new tab, pre-filled with the product's title and URL, and runs a full AI analysis (demand score, competition, ad angles, hooks).
  The content script runs on all AliExpress pages (`www.aliexpress.com`, `aliexpress.com`, any `*.aliexpress.com` subdomain, and the `.us` TLD variants) rather than being restricted by the manifest to `/item/` URLs — this is more reliable since AliExpress is an SPA that can change the URL client-side without a full page load. The script itself checks `window.location.href` for `/item/` before doing anything.
- **The extension popup** (click the toolbar icon) shows the detected product on the current tab with a one-click "Analyze This Product" button, or a link to AliExpress if you're not currently on it.
- **On first install**, the extension opens `launchory.io/welcome` to help new users get oriented.

This is a foundation release — icons are placeholders (see below) and the extension is not yet published to the Chrome Web Store.

## Loading the extension locally (development)

1. Open Chrome and go to `chrome://extensions`.
2. Toggle **Developer mode** on (top-right corner).
3. Click **Load unpacked**.
4. Select this `chrome-extension/` folder.
5. The Launchory icon should appear in your toolbar. Pin it for easy access.
6. Visit any AliExpress product page (a URL containing `/item/`) to see the floating "Analyze with Launchory" button.

After making changes to any file, go back to `chrome://extensions` and click the refresh icon on the Launchory card to reload it.

## Replacing the placeholder icons

`icons/icon16.png`, `icons/icon48.png`, and `icons/icon128.png` are solid-color placeholders generated to be valid, correctly-sized PNGs so the extension loads cleanly. Replace them with real Launchory-branded artwork at the same filenames and dimensions before shipping.

## Building for Chrome Web Store submission

1. Update `manifest.json` — bump `"version"`, double-check `"description"` (max 132 characters for the store listing), and swap in final icon artwork.
2. From this directory, zip the contents (not the folder itself) into a single archive:
   ```bash
   cd chrome-extension
   zip -r ../launchory-extension.zip . -x "*.DS_Store"
   ```
3. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole), create a new item, and upload `launchory-extension.zip`.
4. Fill in the store listing (screenshots, promotional images, privacy policy URL — `launchory.io/privacy` already exists) and submit for review.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Extension configuration (Manifest V3) |
| `content.js` | Runs on AliExpress product pages — detects the product and injects the floating analyze button |
| `popup.html` / `popup.js` | Toolbar popup UI |
| `background.js` | Service worker — handles install event and messages from the content script |
| `icons/` | Toolbar and store-listing icons |
