'use client'

import { useState } from 'react'
import { X, FolderOpen, Check } from 'lucide-react'
import { createCollection, type Collection } from '@/app/lib/collections'
import type { Product } from '@/app/types'

export function CreateCollectionModal({
  userId,
  creatorName,
  availableProducts,
  onClose,
  onCreated,
}: {
  userId: string
  creatorName: string
  availableProducts: Product[]
  onClose: () => void
  onCreated: (collection: Collection) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(availableProducts.map((p) => p.id)))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleProduct(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleCreate() {
    if (!name.trim()) {
      setError('Give your collection a name')
      return
    }
    setSaving(true)
    setError(null)
    const { data, error: createError } = await createCollection(
      userId,
      name.trim(),
      description.trim(),
      Array.from(selectedIds),
      isPublic,
      creatorName
    )
    setSaving(false)
    if (createError || !data) {
      console.error('Failed to create collection:', createError?.message)
      setError('Something went wrong creating the collection.')
      return
    }
    onCreated(data as Collection)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <FolderOpen size={16} className="text-indigo-400" />
            <h2 className="text-white font-bold text-base">Create Collection</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 shrink-0 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors border border-gray-700"
          >
            <X size={14} className="text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">{error}</div>
        )}

        <label className="block text-gray-400 text-xs font-medium mb-1.5">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Winter Fitness Picks"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm mb-4 outline-none focus:border-indigo-500"
        />

        <label className="block text-gray-400 text-xs font-medium mb-1.5">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="What's this collection about?"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm mb-4 resize-none outline-none focus:border-indigo-500"
        />

        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-white text-sm font-medium">Public</p>
            <p className="text-gray-500 text-xs">Anyone with the link can view it</p>
          </div>
          <button
            onClick={() => setIsPublic((v) => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${isPublic ? 'bg-indigo-600' : 'bg-gray-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isPublic ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        {availableProducts.length > 0 && (
          <div className="mb-5">
            <label className="block text-gray-400 text-xs font-medium mb-1.5">
              Products ({selectedIds.size} selected)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {availableProducts.map((product) => {
                const checked = selectedIds.has(product.id)
                return (
                  <button
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-colors ${
                      checked ? 'bg-indigo-600/15 border-indigo-500/30' : 'bg-gray-800/60 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${checked ? 'bg-indigo-600 border-indigo-600' : 'border-gray-600'}`}>
                      {checked && <Check size={11} className="text-white" />}
                    </span>
                    <span className="text-gray-300 text-xs truncate">{product.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          {saving ? 'Creating…' : 'Create Collection'}
        </button>
      </div>
    </div>
  )
}
