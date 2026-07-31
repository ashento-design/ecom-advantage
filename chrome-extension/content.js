// Launchory content script — runs on all AliExpress pages (see manifest.json).
console.log('[Launchory] Content script loaded on:', window.location.href);

const LAUNCHORY_URL = 'https://launchory.io';

function injectButton() {
  if (document.getElementById('launchory-analyze-button')) return;
  console.log('[Launchory] Injecting button...');

  const button = document.createElement('div');
  button.id = 'launchory-analyze-button';
  button.textContent = '🚀 Analyze with Launchory';
  button.style.cssText =
    'position:fixed;bottom:24px;right:24px;z-index:2147483647;' +
    'background:#4f46e5;color:#ffffff;padding:16px 24px;font-size:16px;' +
    'font-weight:700;border-radius:9999px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,0.4);' +
    'font-family:sans-serif;';

  button.addEventListener('click', () => {
    const title = document.title.replace(/\s*-\s*AliExpress.*$/i, '').trim();
    const query = `url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(title)}`;
    window.open(`${LAUNCHORY_URL}/analyze?${query}`, '_blank', 'noopener,noreferrer');
  });

  document.body.appendChild(button);
}

window.addEventListener('load', () => {
  if (window.location.href.includes('/item/')) {
    setTimeout(injectButton, 3000);
  }
});
