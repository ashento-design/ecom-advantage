// Launchory extension service worker.

const LAUNCHORY_URL = 'https://launchory.io';

chrome.runtime.onInstalled.addListener((details) => {
  // launchory.io has no dedicated /welcome onboarding page yet, so this
  // opens the extension's own marketing/help page instead of a 404.
  if (details.reason === 'install') {
    chrome.tabs.create({ url: `${LAUNCHORY_URL}/extension` });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'PRODUCT_DETECTED') {
    chrome.storage.local.set({ launchoryLastProduct: message.product });
  }
  // Always respond so senders using sendMessage as a promise don't hang.
  sendResponse({ received: true });
  return true;
});
