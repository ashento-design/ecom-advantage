'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/app/lib/supabase'
import { useAdminGuard } from '@/app/lib/useAdminGuard'
import { AdminLayout } from '@/app/components/admin/AdminLayout'
import { ProductForm, type ProductFormValues } from '@/app/components/admin/ProductForm'
import type { Product } from '@/app/types'

export default function EditProductPage() {
  const { user, adminChecked } = useAdminGuard()
  const params = useParams<{ id: string }>()
  const productId = params.id
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!adminChecked || !productId) return
    async function load() {
      const supabase = createBrowserClient()
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (fetchError || !data) {
        setNotFound(true)
      } else {
        setProduct(data)
      }
      setLoading(false)
    }
    load()
  }, [adminChecked, productId])

  async function handleSubmit(values: ProductFormValues) {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error === 'server_misconfigured'
          ? 'SUPABASE_SERVICE_ROLE_KEY is not set on the server.'
          : (data?.error ?? 'Failed to update product.'))
        return
      }
      router.push('/admin/products')
    } finally {
      setSubmitting(false)
    }
  }

  if (!adminChecked || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <AdminLayout user={user}>
        <p className="text-gray-400">Product not found.</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout user={user}>
      <h1 className="text-2xl font-bold text-white mb-1">Edit Product</h1>
      <p className="text-gray-400 text-sm mb-8">{product.title}</p>
      <ProductForm
        initialValues={product}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Save Changes"
        error={error}
      />
    </AdminLayout>
  )
}
