// Launchory content script — runs only on AliExpress product pages
// (see manifest.json content_scripts match pattern: */item/*).
//
// AliExpress is a React/Vue SPA: the content script can run before the
// page has hydrated, and the URL can update client-side without a full
// navigation. So injection is made deliberately aggressive/redundant —
// we don't wait on any single signal to decide the button is safe to
// show, we just keep trying until it's on the page.

const LAUNCHORY_URL = 'https://launchory.io';

console.log('[Launchory] content script loaded on', window.location.href);

function isProductPage() {
  return /\/item\//.test(window.location.pathname);
}

function getMetaContent(property) {
  const el =
    document.querySelector(`meta[property="${property}"]`) ||
    document.querySelector(`meta[name="${property}"]`);
  return el ? el.getAttribute('content') : null;
}

function extractTitle() {
  const metaTitle = getMetaContent('og:title');
  if (metaTitle) return metaTitle.trim();

  const h1 = document.querySelector('h1');
  if (h1 && h1.textContent) return h1.textContent.trim();

  return document.title.replace(/\s*-\s*AliExpress.*$/i, '').trim();
}

function extractImage() {
  const metaImage = getMetaContent('og:image');
  if (metaImage) return metaImage;

  const img = document.querySelector('img[class*="magnifier"], img[class*="main-image"], .images-view-item img');
  return img ? img.src : null;
}

function extractPrice() {
  // AliExpress renders price client-side with frequently-changing class
  // names, so this is best-effort: look for the first element whose text
  // looks like a price near the top of the page.
  const candidates = document.querySelectorAll('[class*="price"]');
  for (const el of candidates) {
    const text = el.textContent?.trim();
    if (text && /[\$€£]\s?\d/.test(text) && text.length < 30) {
      return text;
    }
  }
  return null;
}

function buildProduct() {
  return {
    title: extractTitle(),
    image: extractImage(),
    price: extractPrice(),
    url: window.location.href,
  };
}

function injectAnalyzeButton(product) {
  const existing = document.getElementById('launchory-analyze-button');
  if (existing) {
    // The page may have re-rendered with better title/image data since we
    // first injected — keep the button's click target fresh.
    existing.dataset.launchoryTitle = product.title || '';
    return existing;
  }

  if (!document.body) {
    console.log('[Launchory] document.body not ready yet, cannot inject');
    return null;
  }

  const button = document.createElement('button');
  button.id = 'launchory-analyze-button';
  button.type = 'button';
  button.innerHTML = '🚀 Analyze with Launchory';
  button.setAttribute('aria-label', 'Analyze this product with Launchory');
  button.dataset.launchoryTitle = product.title || '';

  Object.assign(button.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '2147483647',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    padding: '14px 22px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)',
    cursor: 'pointer',
    opacity: '0',
    transform: 'translateY(8px)',
    transition: 'opacity 0.4s ease, transform 0.4s ease, box-shadow 0.2s ease',
  });

  button.addEventListener('mouseenter', () => {
    button.style.boxShadow = '0 10px 28px rgba(79, 70, 229, 0.55)';
  });
  button.addEventListener('mouseleave', () => {
    button.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.4)';
  });

  button.addEventListener('click', () => {
    // Re-extract at click time in case the SPA has since hydrated with a
    // better title than whatever we had when the button was first injected.
    const freshTitle = extractTitle() || button.dataset.launchoryTitle || '';
    const query = `url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(freshTitle)}`;
    console.log('[Launchory] opening analyze page with', { url: window.location.href, title: freshTitle });
    window.open(`${LAUNCHORY_URL}/analyze?${query}`, '_blank', 'noopener,noreferrer');
  });

  document.body.appendChild(button);
  console.log('[Launchory] button injected into document.body');

  requestAnimationFrame(() => {
    setTimeout(() => {
      button.style.opacity = '1';
      button.style.transform = 'translateY(0)';
    }, 400);
  });

  return button;
}

function reportProduct(product) {
  chrome.storage?.local?.set({ launchoryLastProduct: product });
  chrome.runtime?.sendMessage?.({ type: 'PRODUCT_DETECTED', product }).catch(() => {});
}

function tryInject(reason) {
  if (!isProductPage()) return;
  const product = buildProduct();
  console.log(`[Launchory] tryInject (${reason})`, product);
  reportProduct(product);
  injectAnalyzeButton(product);
}

function startRetryLoop() {
  const startedAt = Date.now();
  const intervalId = setInterval(() => {
    if (document.getElementById('launchory-analyze-button') || Date.now() - startedAt > 10000) {
      clearInterval(intervalId);
      return;
    }
    tryInject('retry-interval');
  }, 500);
}

function startMutationObserver() {
  const observer = new MutationObserver(() => {
    if (document.getElementById('launchory-analyze-button')) {
      observer.disconnect();
      return;
    }
    // A title element (h1, or AliExpress's og:title meta tag) appearing is
    // our signal that the SPA has hydrated enough to be worth re-checking.
    const hasTitleSignal = document.querySelector('h1') || getMetaContent('og:title');
    if (hasTitleSignal) {
      tryInject('mutation-observer');
    }
  });

  observer.observe(document.documentElement || document, { childList: true, subtree: true });

  // Don't observe forever — bail out after 5s regardless of what we found.
  setTimeout(() => {
    observer.disconnect();
    console.log('[Launchory] MutationObserver timed out after 5s');
  }, 5000);
}

function init() {
  if (!isProductPage()) {
    console.log('[Launchory] not a product page, skipping', window.location.pathname);
    return;
  }

  console.log('[Launchory] init on product page', window.location.href);

  // Fire immediately (covers the case where the page is already hydrated),
  // then layer on a MutationObserver and a fixed-interval retry loop as
  // fallbacks — whichever one wins first "wins", the rest are no-ops once
  // the button exists.
  tryInject('init');
  startMutationObserver();
  startRetryLoop();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// AliExpress can also navigate client-side between product pages without a
// full reload (e.g. clicking a "related product" card), which wouldn't
// otherwise re-run this content script.
let lastUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    console.log('[Launchory] SPA navigation detected', lastUrl);
    const existing = document.getElementById('launchory-analyze-button');
    if (existing) existing.remove();
    init();
  }
}, 1000);
