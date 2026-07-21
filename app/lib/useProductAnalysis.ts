'use client'

import { useState } from 'react'
import type { Product, AnalysisResult } from '@/app/types'

const ANALYZE_ERROR_MESSAGES: Record<string, string> = {
  unauthorized: 'Please sign in to run an AI analysis.',
  profile_not_found: 'We couldn’t find your account. Try refreshing the page.',
  invalid_request_body: 'Something went wrong sending that request. Please try again.',
  analysis_failed: 'The AI analysis failed. Please try again in a moment.',
}

function friendlyAnalyzeError(code: string | undefined) {
  if (!code) return 'Analysis failed. Please try again.'
  return ANALYZE_ERROR_MESSAGES[code] ?? code
}

export function useProductAnalysis() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState<string | null>(null)

  function closeModal() {
    setSelectedProduct(null)
    setAnalysisResult(null)
    setAnalysisError(null)
  }

  async function analyzeProduct(product: Product) {
    setSelectedProduct(product)
    setAnalysisResult(null)
    setAnalysisError(null)
    setAnalysisLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          title: product.title,
          description: product.description,
          niche: product.niche,
        }),
      })
      const data = await res.json()
      if (res.status === 403 && data?.error === 'limit_reached') {
        closeModal()
        setShowUpgradeModal(true)
      } else if (!res.ok) {
        setAnalysisError(friendlyAnalyzeError(data?.error))
      } else {
        setAnalysisResult(data)
      }
    } catch {
      setAnalysisError('Network error. Please try again.')
    } finally {
      setAnalysisLoading(false)
    }
  }

  async function handleUpgrade() {
    setUpgrading(true)
    setUpgradeError(null)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.url) {
        console.error('Stripe checkout failed:', data?.error ?? res.statusText)
        setUpgradeError(data?.error ?? 'Something went wrong starting checkout. Please try again.')
        setUpgrading(false)
        return
      }
      window.location.href = data.url
    } catch (err) {
      console.error('Stripe checkout network error:', err)
      setUpgradeError('Network error. Please try again.')
      setUpgrading(false)
    }
  }

  return {
    selectedProduct,
    analysisResult,
    analysisLoading,
    analysisError,
    showUpgradeModal,
    upgrading,
    upgradeError,
    analyzeProduct,
    closeModal,
    setShowUpgradeModal,
    handleUpgrade,
  }
}
