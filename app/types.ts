export type Product = {
  id: string
  title: string
  description: string
  image_url: string
  niche: string
  supplier_url: string
  demand_score: number
  trend_label: string
  is_featured: boolean
  created_at: string
  views: number
  saves_count: number
}

export type AnalysisResult = {
  demand_score: number
  competition_level: 'Low' | 'Medium' | 'High'
  suggested_price: string
  ad_angles: string[]
  hooks: string[]
  summary: string
  target_audience?: string | null
  best_platforms?: string[] | null
  seasonality?: string | null
  wow_factor?: string | null
}

export type AdFormat = 'square' | 'vertical' | 'horizontal'
export type AdStyle = 'clean' | 'lifestyle' | 'bold' | 'minimalist'

export type GeneratedAd = {
  id: string
  user_id: string
  product_id: string | null
  ad_angle: string
  format: AdFormat
  style: AdStyle
  image_url: string
  created_at: string
}
