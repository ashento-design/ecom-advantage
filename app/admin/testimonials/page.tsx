'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useAdminGuard } from '@/app/lib/useAdminGuard'
import { AdminLayout } from '@/app/components/admin/AdminLayout'
import { TestimonialCard } from '@/app/components/TestimonialCard'

type Testimonial = {
  id: string
  name: string
  role: string | null
  company: string | null
  content: string
  rating: number
  avatar_initials: string
  is_featured: boolean
  created_at: string
}

type FormValues = {
  name: string
  role: string
  company: string
  content: string
  rating: number
  avatar_initials: string
  is_featured: boolean
}

const EMPTY_FORM: FormValues = {
  name: '', role: '', company: '', content: '', rating: 5, avatar_initials: '', is_featured: true,
}

export default function AdminTestimonialsPage() {
  const { user, adminChecked } = useAdminGuard()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormValues>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/testimonials')
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      setLoadError(data?.error === 'server_misconfigured'
        ? 'SUPABASE_SERVICE_ROLE_KEY is not set on the server.'
        : 'Failed to load testimonials.')
      setLoading(false)
      return
    }
    setTestimonials(data)
    setLoading(false)
  }

  useEffect(() => {
    if (!adminChecked) return
    Promise.resolve().then(() => load())
  }, [adminChecked])

  function openAddForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setFormOpen(true)
  }

  function openEditForm(t: Testimonial) {
    setEditingId(t.id)
    setForm({
      name: t.name,
      role: t.role ?? '',
      company: t.company ?? '',
      content: t.content,
      rating: t.rating,
      avatar_initials: t.avatar_initials,
      is_featured: t.is_featured,
    })
    setFormError(null)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      const payload = {
        name: form.name.trim(),
        role: form.role.trim() || null,
        company: form.company.trim() || null,
        content: form.content.trim(),
        rating: form.rating,
        avatar_initials: form.avatar_initials.trim().toUpperCase().slice(0, 3),
        is_featured: form.is_featured,
      }
      const res = editingId
        ? await fetch(`/api/admin/testimonials/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/admin/testimonials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setFormError(data?.error ?? 'Failed to save testimonial.')
        return
      }
      closeForm()
      await load()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial? This can\'t be undone.')) return
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setTestimonials((prev) => prev.filter((t) => t.id !== id))
    }
  }

  async function handleToggleFeatured(t: Testimonial) {
    const res = await fetch(`/api/admin/testimonials/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured: !t.is_featured }),
    })
    if (res.ok) {
      setTestimonials((prev) => prev.map((row) => (row.id === t.id ? { ...row, is_featured: !row.is_featured } : row)))
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
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Testimonials</h1>
          <p className="text-gray-400 text-sm">Manage the social proof shown on the landing page.</p>
        </div>
        <button
          onClick={openAddForm}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={15} />
          Add Testimonial
        </button>
      </div>

      {formOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeForm}>
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="text-white font-bold">{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button onClick={closeForm} className="text-gray-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">{formError}</div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jake M."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Avatar initials</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={form.avatar_initials}
                    onChange={(e) => setForm({ ...form, avatar_initials: e.target.value })}
                    placeholder="JM"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Role</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="Shopify store owner"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Company (optional)</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Quote</label>
                <textarea
                  required
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Rating</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} star{n === 1 ? '' : 's'}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 mt-5 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="accent-emerald-500"
                  />
                  Featured on landing page
                </label>
              </div>

              {form.name && form.content && form.avatar_initials && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2">Preview</p>
                  <TestimonialCard
                    testimonial={{
                      name: form.name,
                      role: form.role || null,
                      company: form.company || null,
                      content: form.content,
                      rating: form.rating,
                      avatar_initials: form.avatar_initials.toUpperCase().slice(0, 3),
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                {submitting ? 'Saving…' : editingId ? 'Save Changes' : 'Add Testimonial'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loadError && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{loadError}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        !loadError && <div className="text-center py-20 text-gray-500">No testimonials yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.id} className="relative">
              <TestimonialCard testimonial={t} />
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                {!t.is_featured && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 text-gray-500 border border-gray-700">Hidden</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleToggleFeatured(t)}
                  className={`flex-1 text-xs font-medium py-2 rounded-lg border transition-colors ${
                    t.is_featured
                      ? 'bg-emerald-600/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/25'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
                  }`}
                >
                  {t.is_featured ? 'Featured' : 'Not featured'}
                </button>
                <button
                  onClick={() => openEditForm(t)}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-red-900/40 text-gray-400 hover:text-red-300 border border-gray-700 hover:border-red-500/40 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
