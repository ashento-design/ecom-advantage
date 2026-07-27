'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const left = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)

  const pages: (number | 'ellipsis')[] = [1]
  if (left > 2) pages.push('ellipsis')
  for (let p = left; p <= right; p++) pages.push(p)
  if (right < total - 1) pages.push('ellipsis')
  pages.push(total)

  return pages
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 border border-gray-800 hover:border-gray-600 hover:text-white transition-colors disabled:opacity-30 disabled:hover:border-gray-800 disabled:hover:text-gray-400 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-600 text-sm select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-label={`Go to page ${p}`}
            aria-current={p === currentPage ? 'page' : undefined}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
              p === currentPage
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 border border-gray-800 hover:border-gray-600 hover:text-white hover:bg-gray-800'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 border border-gray-800 hover:border-gray-600 hover:text-white transition-colors disabled:opacity-30 disabled:hover:border-gray-800 disabled:hover:text-gray-400 disabled:cursor-not-allowed"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}
