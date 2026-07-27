// The Facebook Ad Library and TikTok Creative Center are both genuinely
// public, no-login-required search tools — these are real, working search
// URLs, not guesses. Google Trends rounds out the "what's the ad/search
// landscape for this product" picture.
export function buildAdSearchLinks(title: string) {
  const q = encodeURIComponent(title)
  return {
    facebook: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=${q}&search_type=keyword_unordered`,
    tiktok: `https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en?search=${q}`,
    google: `https://trends.google.com/trends/explore?q=${q}`,
  }
}

export type AdActivityLevel = 'High' | 'Medium' | 'Low'

const AD_ACTIVITY_BY_TREND: Record<string, AdActivityLevel> = {
  Hot: 'High',
  Trending: 'Medium',
  Rising: 'Low',
}

export function getAdActivityLevel(trendLabel: string): AdActivityLevel {
  return AD_ACTIVITY_BY_TREND[trendLabel] ?? 'Low'
}
