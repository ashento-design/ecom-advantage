// Launchory extension popup logic.

const LAUNCHORY_URL = 'https://launchory.io';

function cleanTabTitle(tabTitle) {
  // Fallback title straight from the tab, in case the content script never
  // got a chance to detect/report anything (e.g. popup opened immediately
  // on page load, or injection failed for some reason on this page).
  return (tabTitle || '').replace(/\s*-\s*AliExpress.*$/i, '').trim();
}

function render(product, tab) {
  const content = document.getElementById('content');
  const tabUrl = tab?.url || '';
  const isAliExpress = /aliexpress\.(com|us)/.test(tabUrl);
  const isProductPage = isAliExpress && /\/item\//.test(tabUrl);

  console.log('[Launchory popup]', { tabUrl, isAliExpress, isProductPage, product });

  // Show the analyze action for ANY AliExpress product page, whether or
  // not the content script has reported a product yet — falling back to
  // the tab's own title (always available via chrome.tabs.query, no
  // content-script communication required).
  const title = product?.title || cleanTabTitle(tab?.title);

  if (isProductPage) {
    content.innerHTML = `
      <p class="label">${product?.title ? 'Detected product' : 'AliExpress product page'}</p>
      <p class="product-title"></p>
      <button class="btn btn-primary" id="analyze-btn">Analyze This Product →</button>
      <p class="powered-by">Powered by Launchory AI</p>
    `;
    content.querySelector('.product-title').textContent = title || 'This product';

    document.getElementById('analyze-btn').addEventListener('click', () => {
      const query = `url=${encodeURIComponent(tabUrl)}&title=${encodeURIComponent(title)}`;
      chrome.tabs.create({ url: `${LAUNCHORY_URL}/analyze?${query}` });
    });
  } else if (isAliExpress) {
    content.innerHTML = `
      <p class="empty-state">Open a specific product page on AliExpress to analyze it with Launchory.</p>
      <a class="dashboard-link" id="dashboard-link" href="${LAUNCHORY_URL}">Open Launchory Dashboard →</a>
    `;
  } else {
    content.innerHTML = `
      <p class="empty-state">Visit an AliExpress product page to analyze it with AI.</p>
      <button class="btn btn-secondary" id="visit-btn">Open AliExpress</button>
      <a class="dashboard-link" id="dashboard-link" href="${LAUNCHORY_URL}">Open Launchory Dashboard →</a>
    `;
    document.getElementById('visit-btn').addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://www.aliexpress.com' });
    });
  }
}

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  const tabUrl = tab?.url || '';
  chrome.storage.local.get(['launchoryLastProduct'], (result) => {
    const product = result.launchoryLastProduct;
    // Only trust the stored product if it was detected on this same tab's
    // current URL — otherwise it's stale from a previously viewed product.
    const isFresh = product?.url === tabUrl;
    render(isFresh ? product : null, tab);
  });
});
