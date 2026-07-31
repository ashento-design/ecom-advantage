// Launchory content script — runs only on AliExpress product pages
// (see manifest.json content_scripts match pattern: */item/*).

const LAUNCHORY_URL = 'https://launchory.io';

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

function injectAnalyzeButton(product) {
  if (document.getElementById('launchory-analyze-button')) return;

  const button = document.createElement('button');
  button.id = 'launchory-analyze-button';
  button.type = 'button';
  button.innerHTML = '🚀 Analyze with Launchory';
  button.setAttribute('aria-label', 'Analyze this product with Launchory');

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
    const params = new URLSearchParams({
      url: window.location.href,
      title: product.title || '',
    });
    window.open(`${LAUNCHORY_URL}/analyze?${params.toString()}`, '_blank', 'noopener,noreferrer');
  });

  document.body.appendChild(button);

  // Fade in smoothly once the page has settled, rather than popping in
  // immediately alongside AliExpress's own page-load layout shifts.
  requestAnimationFrame(() => {
    setTimeout(() => {
      button.style.opacity = '1';
      button.style.transform = 'translateY(0)';
    }, 400);
  });
}

function init() {
  if (!isProductPage()) return;

  const product = {
    title: extractTitle(),
    image: extractImage(),
    price: extractPrice(),
    url: window.location.href,
  };

  chrome.storage?.local?.set({ launchoryLastProduct: product });
  chrome.runtime?.sendMessage?.({ type: 'PRODUCT_DETECTED', product }).catch(() => {});

  injectAnalyzeButton(product);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
