import { Star, Quote } from 'lucide-react'

export type TestimonialData = {
  name: string
  role: string | null
  company: string | null
  content: string
  rating: number
  avatar_initials: string
}

const AVATAR_COLORS = ['bg-indigo-600', 'bg-emerald-600', 'bg-orange-600', 'bg-pink-600', 'bg-cyan-600']

// Deterministic color per name so testimonials don't need their own DB
// column just to stay visually consistent between renders.
function colorForName(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export function TestimonialCard({ testimonial }: { testimonial: TestimonialData }) {
  const subtitle = [testimonial.role, testimonial.company].filter(Boolean).join(' · ')
  return (
    <div className="relative h-full flex flex-col bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-colors overflow-hidden">
      <Quote size={64} className="absolute -top-2 -right-2 text-indigo-500/10 rotate-180" aria-hidden />
      <div className="relative flex items-center gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} className={i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'} />
        ))}
      </div>
      <p className="text-gray-300 text-sm leading-relaxed mb-5">&ldquo;{testimonial.content}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full ${colorForName(testimonial.name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
          {testimonial.avatar_initials}
        </div>
        <div>
          <p className="text-white text-sm font-semibold">{testimonial.name}</p>
          {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
