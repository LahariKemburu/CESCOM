import { useEffect, useState } from 'react'
import Modal from '../common/Modal'
import StockActivityList from './StockActivityList'
import { UOM_LABELS, formatQuantity, getStockSummary } from '../../services/items/itemService'
import type { Item, StockSummary } from '../../services/items/itemService'

const DAY_OPTIONS = [3, 4, 7, 30]

export default function SummaryModal({ item, onClose }: { item: Item; onClose: () => void }) {
  const [days, setDays] = useState(4)
  const [result, setResult] = useState<{ days: number; summary: StockSummary } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getStockSummary(days, item.id)
      .then((summary) => {
        if (cancelled) return
        setResult({ days, summary })
        setError('')
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load the summary')
      })
    return () => {
      cancelled = true
    }
  }, [days, item.id])

  const loading = !error && result?.days !== days
  const summary = result?.summary
  const unit = UOM_LABELS[item.uom]

  return (
    <Modal title="Stock summary" onClose={onClose} wide>
      <div className="mb-4">
        <p className="font-mono text-xs text-slate-800">{item.itemCode}</p>
        <p className="mt-1 text-sm text-slate-600">{item.description}</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {DAY_OPTIONS.map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              days === d
                ? 'bg-navy-700 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Last {d} days
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">Current stock</p>
          <p className="mt-1 text-lg font-semibold text-navy-800">
            {formatQuantity(item.quantity)} {unit}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">Added</p>
          <p className="mt-1 text-lg font-semibold text-green-700">
            +{summary ? formatQuantity(summary.inQuantity) : '-'}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">Removed</p>
          <p className="mt-1 text-lg font-semibold text-red-600">
            -{summary ? formatQuantity(summary.outQuantity) : '-'}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-slate-500">Loading...</p>
      ) : (
        summary && <StockActivityList movements={summary.movements} perItem />
      )}
    </Modal>
  )
}