// Launchory content script — runs on all AliExpress pages (see manifest.json).
console.log('[Launchory] Content script loaded on:', window.location.href);

const LAUNCHORY_URL = 'https://launchory.io';
const BUTTON_ID = 'launchory-analyze-button';

// Dismissal is scoped to the product URL (query string stripped, since
// AliExpress often appends session/tracking params that vary per visit)
// so a user who hides the button on one product still sees it on others.
function dismissKey(url) {
  return `launchoryDismissed:${url.split('?')[0]}`;
}

function injectPulseStyle() {
  if (document.getElementById('launchory-pulse-style')) return;
  const style = document.createElement('style');
  style.id = 'launchory-pulse-style';
  style.textContent = `
    @keyframes launchory-pulse {
      0% { transform: scale(1); box-shadow: 0 8px 24px rgba(79, 70, 229, 0.25); }
      50% { transform: scale(1.06); box-shadow: 0 10px 32px rgba(79, 70, 229, 0.55); }
      100% { transform: scale(1); box-shadow: 0 8px 24px rgba(79, 70, 229, 0.25); }
    }
  `;
  document.head.appendChild(style);
}

function renderButton(key) {
  injectPulseStyle();

  const wrap = document.createElement('div');
  wrap.id = BUTTON_ID;
  wrap.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 24px;
    z-index: 2147483647;
    height: 44px;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 22px;
    white-space: nowrap;
    background: #4F46E5;
    color: #ffffff;
    border-radius: 9999px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(79, 70, 229, 0.25);
    transition: background 150ms ease, box-shadow 150ms ease;
    user-select: none;
    animation: launchory-pulse 0.7s ease-in-out 1;
  `;
  wrap.innerHTML = '<span>🚀 Analyze with Launchory</span>';

  wrap.addEventListener('mouseenter', () => {
    wrap.style.background = '#6366F1';
  });
  wrap.addEventListener('mouseleave', () => {
    wrap.style.background = '#4F46E5';
  });

  wrap.addEventListener('click', () => {
    const title = document.title.replace(/\s*-\s*AliExpress.*$/i, '').trim();
    const query = `url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(title)}`;
    window.open(`${LAUNCHORY_URL}/analyze?${query}`, '_blank', 'noopener,noreferrer');
  });

  const closeBtn = document.createElement('button');
  closeBtn.setAttribute('aria-label', 'Dismiss Launchory button');
  closeBtn.innerHTML =
    '<svg width="9" height="9" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
    '</svg>';
  closeBtn.style.cssText = `
    position: absolute;
    top: -7px;
    right: -7px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #f9fafb;
    color: #4b5563;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    margin: 0;
    transition: background 150ms ease, color 150ms ease;
  `;
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = '#ffffff';
    closeBtn.style.color = '#111827';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = '#f9fafb';
    closeBtn.style.color = '#4b5563';
  });
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    chrome.storage?.local?.set({ [key]: true });
    wrap.remove();
    console.log('[Launchory] Button dismissed for this product');
  });

  wrap.appendChild(closeBtn);
  document.body.appendChild(wrap);
}

function injectButton() {
  if (document.getElementById(BUTTON_ID)) return;
  console.log('[Launchory] Injecting button...');

  const key = dismissKey(window.location.href);
  if (!chrome.storage?.local) {
    renderButton(key);
    return;
  }
  chrome.storage.local.get([key], (result) => {
    if (result[key]) {
      console.log('[Launchory] Button was dismissed on this product, not re-showing');
      return;
    }
    renderButton(key);
  });
}

window.addEventListener('load', () => {
  if (window.location.href.includes('/item/')) {
    setTimeout(injectButton, 3000);
  }
});
