'use client'

import { useState } from 'react'
import { X, FlaskConical } from 'lucide-react'
import { TEST_STATUS_OPTIONS, type TestStatus } from '@/app/lib/productTests'

export function TrackProductModal({
  productTitle,
  onClose,
  onSave,
  saving,
}: {
  productTitle: string
  onClose: () => void
  onSave: (status: TestStatus, notes: string) => void
  saving: boolean
}) {
  const [status, setStatus] = useState<TestStatus>('testing')
  const [notes, setNotes] = useState('')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-1">
          <div className="flex items-center gap-2">
            <FlaskConical size={16} className="text-indigo-400" />
            <h2 className="text-white font-bold text-base">Add to Testing Board</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 shrink-0 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors border border-gray-700"
          >
            <X size={14} className="text-gray-400" />
          </button>
        </div>
        <p className="text-gray-500 text-xs mb-4 line-clamp-1">{productTitle}</p>

        <label className="block text-gray-400 text-xs font-medium mb-1.5">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TestStatus)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm mb-4 outline-none focus:border-indigo-500"
        >
          {TEST_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <label className="block text-gray-400 text-xs font-medium mb-1.5">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any notes about this test..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm mb-5 resize-none outline-none focus:border-indigo-500"
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(status, notes)}
            disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            {saving ? 'Adding…' : 'Add to Board'}
          </button>
        </div>
      </div>
    </div>
  )
}
