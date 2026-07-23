'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAdminGuard } from '@/app/lib/useAdminGuard'
import { AdminLayout } from '@/app/components/admin/AdminLayout'
import { ProductForm, type ProductFormValues } from '@/app/components/admin/ProductForm'

function NewProductForm() {
  const { user, adminChecked } = useAdminGuard()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefillTitle = searchParams.get('title') ?? undefined

  async function handleSubmit(values: ProductFormValues) {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error === 'server_misconfigured'
          ? 'SUPABASE_SERVICE_ROLE_KEY is not set on the server.'
          : (data?.error ?? 'Failed to create product.'))
        return
      }
      router.push('/admin/products')
    } finally {
      setSubmitting(false)
    }
  }

  if (!adminChecked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AdminLayout user={user}>
      <h1 className="text-2xl font-bold text-white mb-1">Add Product</h1>
      <p className="text-gray-400 text-sm mb-8">Create a new product listing for the feed.</p>
      <ProductForm
        initialValues={prefillTitle ? { title: prefillTitle } : undefined}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Create Product"
        error={error}
      />
    </AdminLayout>
  )
}

export default function NewProductPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <NewProductForm />
    </Suspense>
  )
}
