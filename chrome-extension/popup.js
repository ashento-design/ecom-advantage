// Launchory extension popup logic.

const LAUNCHORY_URL = 'https://launchory.io';

document.getElementById('dashboard-link').href = LAUNCHORY_URL;

function render(product, tabUrl) {
  const content = document.getElementById('content');
  const isAliExpress = /aliexpress\.(com|us)/.test(tabUrl || '');
  const isProductPage = isAliExpress && /\/item\//.test(tabUrl || '');

  if (isProductPage && product?.title) {
    content.innerHTML = `
      <p class="label">Detected product</p>
      <p class="product-title"></p>
      <button class="btn btn-primary" id="analyze-btn">🚀 Analyze This Product</button>
    `;
    content.querySelector('.product-title').textContent = product.title;

    document.getElementById('analyze-btn').addEventListener('click', () => {
      const params = new URLSearchParams({ url: tabUrl, title: product.title || '' });
      chrome.tabs.create({ url: `${LAUNCHORY_URL}/analyze?${params.toString()}` });
    });
  } else if (isAliExpress) {
    content.innerHTML = `
      <p class="empty-state">Open a specific product page on AliExpress to analyze it with Launchory.</p>
    `;
  } else {
    content.innerHTML = `
      <p class="empty-state">Visit AliExpress to analyze products.</p>
      <button class="btn btn-secondary" id="visit-btn">Go to AliExpress</button>
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
    render(isFresh ? product : null, tabUrl);
  });
});
