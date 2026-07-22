// AliExpress has a genuinely public product-search URL, already used
// elsewhere in this app. CJDropshipping's storefront search and
// Zendrop's catalog (which lives behind a merchant login at
// app.zendrop.com, not a public page) don't have a confirmed public
// search-by-keyword URL, so those route through a Google site-search
// instead of guessing a direct URL that might silently 404.
export function buildSupplierLinks(title: string) {
  const q = encodeURIComponent(title)
  return {
    aliexpress: `https://www.aliexpress.com/wholesale?SearchText=${q}`,
    cjdropshipping: `https://www.google.com/search?q=${q}+site:cjdropshipping.com`,
    zendrop: `https://www.google.com/search?q=${q}+site:zendrop.com`,
  }
}
