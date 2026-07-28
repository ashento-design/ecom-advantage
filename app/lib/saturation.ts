export type SaturationTier = 'High Demand' | 'Growing' | 'Low Competition' | 'Untapped'

export type SaturationInfo = {
  tier: SaturationTier
  storeCount: number
  storeCountLabel: string
  badgeLabel: string
  rangeText: string
  pillClass: string
  cardAccentClass: string
  iconClass: string
  meaning: string
  recommendation: string
}

const TIER_META: Record<SaturationTier, {
  rangeText: string
  midpoint: number
  pillClass: string
  cardAccentClass: string
  iconClass: string
  meaning: string
  recommendation: string
}> = {
  'High Demand': {
    rangeText: 'Est. 2,400+ stores selling this',
    midpoint: 2400,
    pillClass: 'bg-red-500/15 text-red-400 border-red-500/30',
    cardAccentClass: 'border-red-500/30 bg-red-500/5',
    iconClass: 'text-red-400',
    meaning: 'This product is already being sold by a large number of stores, so raw demand alone won\'t be enough to win.',
    recommendation: 'High competition — you\'ll need a standout angle or ad creative to break through, not just the product.',
  },
  Growing: {
    rangeText: 'Est. 800-2,400 stores selling this',
    midpoint: 1600,
    pillClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    cardAccentClass: 'border-orange-500/30 bg-orange-500/5',
    iconClass: 'text-orange-400',
    meaning: 'A meaningful number of stores have picked this up, but the market isn\'t saturated yet.',
    recommendation: 'Moderate competition — there\'s still room if you move quickly with a solid angle.',
  },
  'Low Competition': {
    rangeText: 'Est. 200-800 stores selling this',
    midpoint: 500,
    pillClass: 'bg-green-500/15 text-green-400 border-green-500/30',
    cardAccentClass: 'border-green-500/30 bg-green-500/5',
    iconClass: 'text-green-400',
    meaning: 'Relatively few stores are actively selling this right now.',
    recommendation: 'Low competition — good time to enter this market before it gets crowded.',
  },
  Untapped: {
    rangeText: 'Est. under 200 stores selling this',
    midpoint: 100,
    pillClass: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    cardAccentClass: 'border-teal-500/30 bg-teal-500/5',
    iconClass: 'text-teal-400',
    meaning: 'This product hasn\'t been widely tested by other stores yet — you could be an early mover.',
    recommendation: 'Untapped market — early-mover advantage, but validate real demand before scaling ad spend.',
  },
}

// Ranked lowest-saturation (least competitive) to highest, used by the
// dashboard's "Lowest Saturation" sort.
export const SATURATION_TIER_RANK: Record<SaturationTier, number> = {
  Untapped: 0,
  'Low Competition': 1,
  Growing: 2,
  'High Demand': 3,
}

// The four tiers map directly onto demand_score bands, which is also the
// axis trend_label is derived from in this app's product data (Hot skews
// high demand, Rising skews low) — so demand_score alone is a reliable,
// exhaustive driver without needing a separate trend_label branch per tier.
function tierForDemandScore(demandScore: number): SaturationTier {
  if (demandScore >= 88) return 'High Demand'
  if (demandScore >= 78) return 'Growing'
  if (demandScore >= 70) return 'Low Competition'
  return 'Untapped'
}

// Simple deterministic string hash so the "randomized" variance is stable
// per product id — same product always shows the same store count.
function seededVariance(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  const normalized = (Math.abs(hash) % 1000) / 1000
  return 0.7 + normalized * 0.6
}

function roundToNearest(value: number, step: number) {
  return Math.max(step, Math.round(value / step) * step)
}

export function getSaturationInfo(product: { id: string; demand_score: number; trend_label: string }): SaturationInfo {
  const tier = tierForDemandScore(product.demand_score)
  const meta = TIER_META[tier]

  const variance = seededVariance(product.id)
  const roundStep = meta.midpoint >= 1000 ? 100 : 10
  const storeCount = roundToNearest(meta.midpoint * variance, roundStep)

  const storeCountLabel = tier === 'Untapped'
    ? `under ${storeCount.toLocaleString()}`
    : `${storeCount.toLocaleString()}+`

  const badgeLabel = `${storeCountLabel} stores`

  return {
    tier,
    storeCount,
    storeCountLabel,
    badgeLabel,
    rangeText: meta.rangeText,
    pillClass: meta.pillClass,
    cardAccentClass: meta.cardAccentClass,
    iconClass: meta.iconClass,
    meaning: meta.meaning,
    recommendation: meta.recommendation,
  }
}
