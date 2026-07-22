// Combines demand score and view count into a simple trending signal.
// Thresholds are deliberately conservative — views start at 0 for every
// product, so nothing shows as "trending" until real traffic accumulates.
export function isTrending(demandScore: number, views: number) {
  return demandScore >= 75 && views >= 20
}
