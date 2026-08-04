# Launchory Chrome Extension — Privacy Policy

_Last updated: 2026-08-03_

This policy covers the Launchory Chrome extension specifically. For the
Launchory website and account privacy policy, see [launchory.io/privacy](https://launchory.io/privacy).

## What we collect

The Launchory extension only sends data to our servers when you actively
click "Analyze with Launchory" — either the floating on-page button or the
"Analyze This Product" button in the extension popup. At that moment, we
send:

- The **product page URL** you were viewing on AliExpress
- The **product title**, read from the page you were on

That's it. Nothing is collected in the background, and nothing is
collected just from installing the extension or browsing AliExpress
without clicking Analyze.

## What we do NOT collect

The extension does not collect, and never sends to our servers:

- Your general browsing history, or activity on any site other than the
  specific AliExpress page you chose to analyze
- Personal information such as your name, address, or phone number
- Passwords, payment details, or any form data you enter on AliExpress
  or any other site
- Cookies or session data from AliExpress or any other website

The extension only requests the minimum Chrome permissions needed to
detect AliExpress product pages and show the analyze button
(`activeTab` and `storage`) — it does not have permission to read or
modify other websites.

## How your data is used

The product URL and title you send are used solely to run the AI
analysis you requested — generating a demand score, competition
estimate, suggested pricing, ad angles, and related insights — and to
display that analysis to you on `launchory.io/analyze`. We do not sell
this data, and we do not share it with third parties except the AI
provider we use to generate the analysis itself (OpenAI), strictly to
perform that analysis.

If you're signed in to your Launchory account, the analyzed product may
also be saved to your account's history/dashboard so you can find it
again later — this is the same product data described above, tied to
your account instead of being anonymous.

## Local storage

The extension stores a small amount of data locally in your browser
(via `chrome.storage.local`), not on our servers:

- The most recently detected product, so the popup can show it instantly
- Which products you've dismissed the floating button on, so it doesn't
  reappear on the same product page

This local data stays on your device and is only cleared when you
remove the extension or clear your browser's extension storage.

## Data retention

Analyzed products tied to a signed-in Launchory account are retained for
as long as your account is active, so you can revisit past analyses. If
you delete your Launchory account, associated analysis history is
deleted along with it. Anonymous analyses (when not signed in) are not
persisted beyond the single session used to generate the result.

## Changes to this policy

If this policy changes, we'll update the "Last updated" date above. For
material changes, we'll also note it in the extension's Chrome Web
Store listing.

## Contact

Questions about this policy or your data? Email us at
**hello@launchory.io**.
