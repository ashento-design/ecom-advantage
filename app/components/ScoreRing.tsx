export function ScoreRing({ score, size = 'sm' }: { score: number; size?: 'sm' | 'lg' | 'xl' }) {
  const color = score >= 85 ? '#ef4444' : score >= 70 ? '#f97316' : '#3b82f6'
  const dim = size === 'xl' ? 'w-32 h-32' : size === 'lg' ? 'w-24 h-24' : 'w-14 h-14'
  const textSize = size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-2xl' : 'text-sm'
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative ${dim} rounded-full flex items-center justify-center`}
        style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #1f2937 0deg)` }}
      >
        <div className="absolute inset-1 rounded-full bg-gray-900 flex items-center justify-center">
          <span className={`${textSize} font-bold text-white`}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500">demand</span>
    </div>
  )
}
