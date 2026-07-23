const TREND_BONUS: Record<string, number> = { Hot: 10, Trending: 5, Rising: 0 }

export type LaunchoryScoreBreakdown = {
  score: number
  label: string
  demandPoints: number
  viewsPoints: number
  savesPoints: number
  trendPoints: number
}

// Launchory Score = (demand_score * 0.4) + (views * 2, capped at 30)
//   + (saves * 5, capped at 20) + (trend bonus: Hot=10, Trending=5, Rising=0)
// Max possible: 40 + 30 + 20 + 10 = 100.
export function computeLaunchoryScore(product: {
  demand_score: number
  views: number
  saves_count: number
  trend_label: string
}): LaunchoryScoreBreakdown {
  const demandPoints = product.demand_score * 0.4
  const viewsPoints = Math.min((product.views ?? 0) * 2, 30)
  const savesPoints = Math.min((product.saves_count ?? 0) * 5, 20)
  const trendPoints = TREND_BONUS[product.trend_label] ?? 0

  const score = Math.round(demandPoints + viewsPoints + savesPoints + trendPoints)

  return {
    score,
    label: launchoryScoreLabel(score),
    demandPoints,
    viewsPoints,
    savesPoints,
    trendPoints,
  }
}

export function launchoryScoreLabel(score: number): string {
  if (score >= 90) return '🔥 On Fire'
  if (score >= 80) return '⚡ Hot Pick'
  if (score >= 70) return '📈 Rising Star'
  return '👀 Watch This'
}
