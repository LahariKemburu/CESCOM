import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, History, Minus, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import ItemFormModal from '../../components/warehouse/ItemFormModal'
import StockModal from '../../components/warehouse/StockModal'
import SummaryModal from '../../components/warehouse/SummaryModal'
import {
  UOM_LABELS,
  UOM_OPTIONS,
  deleteItem,
  formatQuantity,
  getItems,
} from '../../services/items/itemService'
import type { Item, ItemPage, StockFilter, StockType, Uom } from '../../services/items/itemService'

const PAGE_SIZE = 20

type ModalState =
  | { type: 'create' }
  | { type: 'edit'; item: Item }
  | { type: 'stock'; item: Item; stockType: StockType }
  | { type: 'summary'; item: Item }
  | null

type StepperProps = {
  item: Item
  canManage: boolean
  large?: boolean
  onStep: (type: StockType) => void
}

// [-] 380 [+] with the unit underneath. "large" gives phone-sized tap targets.
function StockStepper({ item, canManage, large, onStep }: StepperProps) {
  const button = `inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-40 ${
    large ? 'h-11 w-11' : 'h-8 w-8'
  }`
  const iconSize = large ? 20 : 16

  return (
    <div className="flex items-center justify-end gap-2">
      {canManage && (
        <button
          onClick={() => onStep('OUT')}
          disabled={item.quantity === 0}
          className={`${button} hover:border-red-400 hover:text-red-600`}
          title="Decrease stock"
          aria-label={`Decrease stock for ${item.itemCode}`}
        >
          <Minus size={iconSize} />
        </button>
      )}
      <div className={`text-center ${large ? 'min-w-[4.5rem]' : 'min-w-[3.5rem]'}`}>
        <p
          className={`font-semibold leading-tight ${large ? 'text-xl' : 'text-base'} ${
            item.quantity === 0 ? 'text-red-600' : 'text-navy-800'
          }`}
        >
          {formatQuantity(item.quantity)}
        </p>
        <p className="text-xs text-slate-400">{UOM_LABELS[item.uom]}</p>
      </div>
      {canManage && (
        <button
          onClick={() => onStep('IN')}
          className={`${button} hover:border-green-500 hover:text-green-700`}
          title="Increase stock"
          aria-label={`Increase stock for ${item.itemCode}`}
        >
          <Plus size={iconSize} />
        </button>
      )}
    </div>
  )
}

type ActionsProps = {
  item: Item
  canManage: boolean
  busy: boolean
  variant: 'icons' | 'labeled'
  onSummary: () => void
  onEdit: () => void
  onDelete: () => void
}

function ItemActions({ item, canManage, busy, variant, onSummary, onEdit, onDelete }: ActionsProps) {
  if (variant === 'icons') {
    const icon =
      'inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-navy-700 disabled:cursor-not-allowed disabled:opacity-40'
    return (
      <div className="flex items-center justify-end gap-1">
        <button onClick={onSummary} className={icon} title="Stock summary" aria-label={`Stock summary for ${item.itemCode}`}>
          <History size={17} />
        </button>
        {canManage && (
          <>
            <button onClick={onEdit} className={icon} title="Edit item" aria-label={`Edit ${item.itemCode}`}>
              <Pencil size={17} />
            </button>
            <button
              onClick={onDelete}
              disabled={busy}
              className={`${icon} hover:!bg-red-50 hover:!text-red-600`}
              title="Delete item"
              aria-label={`Delete ${item.itemCode}`}
            >
              <Trash2 size={17} />
            </button>
          </>
        )}
      </div>
    )
  }

  const base =
    'inline-flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition hover:bg-slate-50 disabled:opacity-60'
  return (
    <div className={`grid gap-2 ${canManage ? 'grid-cols-3' : 'grid-cols-1'}`}>
      <button onClick={onSummary} className={`${base} border-slate-300 text-slate-700`}>
        <History size={16} /> Summary
      </button>
      {canManage && (
        <>
          <button onClick={onEdit} className={`${base} border-slate-300 text-slate-700`}>
            <Pencil size={16} /> Edit
          </button>
          <button onClick={onDelete} disabled={busy} className={`${base} border-red-200 text-red-600`}>
            <Trash2 size={16} /> Delete
          </button>
        </>
      )}
    </div>
  )
}

function OutOfStockTag() {
  return (
    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">Out of stock</span>
  )
}

export default function Items() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const canManage = isAdmin || user?.role === 'WAREHOUSE_MANAGER'

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [uom, setUom] = useState<Uom | ''>('')
  const [stock, setStock] = useState<StockFilter | ''>('')
  const [page, setPage] = useState(1)
  const [reloadTick, setReloadTick] = useState(0)

  const [data, setData] = useState<ItemPage | null>(null)
  const [loadedKey, setLoadedKey] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)

  const key = `${search}|${uom}|${stock}|${page}|${reloadTick}`
  const loading = loadedKey !== key

  // Wait a moment after typing before searching.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    let cancelled = false
    getItems({ search, uom, stock, page, pageSize: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return
        setData(result)
        setError('')
        setLoadedKey(key)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Could not load items')
        setLoadedKey(key)
      })
    return () => {
      cancelled = true
    }
  }, [search, uom, stock, page, key])

  const reload = () => setReloadTick((t) => t + 1)

  const handleSaved = (message: string) => {
    setModal(null)
    setNotice(message)
    reload()
  }

  const handleDelete = async (item: Item) => {
    if (!window.confirm(`Delete ${item.itemCode}? This cannot be undone.`)) return
    setBusyId(item.id)
    setError('')
    setNotice('')
    try {
      setNotice(await deleteItem(item.id))
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the item')
    } finally {
      setBusyId(null)
    }
  }

  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)

  const selectClass = 'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm md:w-auto'

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-800">Items &amp; Stock</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data ? `${total} item${total === 1 ? '' : 's'}` : 'Loading...'}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setModal({ type: 'create' })}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-navy-800 sm:w-auto sm:py-2.5"
          >
            <Plus size={16} /> Add item
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by item code or description"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 md:contents">
            <select
              value={uom}
              onChange={(e) => {
                setUom(e.target.value as Uom | '')
                setPage(1)
              }}
              className={selectClass}
            >
              <option value="">All UOMs</option>
              {UOM_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {UOM_LABELS[u]}
                </option>
              ))}
            </select>
            <select
              value={stock}
              onChange={(e) => {
                setStock(e.target.value as StockFilter | '')
                setPage(1)
              }}
              className={selectClass}
            >
              <option value="">All stock</option>
              <option value="IN_STOCK">In stock</option>
              <option value="OUT_OF_STOCK">Out of stock</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {notice}
          </div>
        )}

        {!data ? (
          <p className="py-10 text-center text-sm text-slate-500">Loading...</p>
        ) : data.items.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">No items found.</p>
        ) : (
          <div className={`transition-opacity ${loading ? 'opacity-50' : ''}`}>
            {/* Phones: one card per item */}
            <ul className="grid gap-3 sm:grid-cols-2 md:hidden">
              {data.items.map((item) => (
                <li key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="break-all font-mono text-xs text-slate-800">{item.itemCode}</span>
                    {item.quantity === 0 && <OutOfStockTag />}
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-700">{item.description}</p>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Stock</p>
                    <StockStepper
                      item={item}
                      canManage={canManage}
                      large
                      onStep={(type) => setModal({ type: 'stock', item, stockType: type })}
                    />
                  </div>

                  <div className="mt-4">
                    <ItemActions
                      item={item}
                      canManage={canManage}
                      busy={busyId === item.id}
                      variant="labeled"
                      onSummary={() => setModal({ type: 'summary', item })}
                      onEdit={() => setModal({ type: 'edit', item })}
                      onDelete={() => handleDelete(item)}
                    />
                  </div>
                </li>
              ))}
            </ul>

            {/* Tablets and desktops: compact table */}
            <div className="hidden md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-4 font-medium">Item</th>
                    <th className="py-2 pr-6 text-right font-medium">Stock</th>
                    <th className="py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 align-top">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-slate-800">{item.itemCode}</span>
                          {item.quantity === 0 && <OutOfStockTag />}
                        </div>
                        <p className="mt-1 line-clamp-2 text-slate-700" title={item.description}>
                          {item.description}
                        </p>
                      </td>
                      <td className="whitespace-nowrap py-3 pr-6 align-top">
                        <StockStepper
                          item={item}
                          canManage={canManage}
                          onStep={(type) => setModal({ type: 'stock', item, stockType: type })}
                        />
                      </td>
                      <td className="whitespace-nowrap py-3 align-top">
                        <ItemActions
                          item={item}
                          canManage={canManage}
                          busy={busyId === item.id}
                          variant="icons"
                          onSummary={() => setModal({ type: 'summary', item })}
                          onEdit={() => setModal({ type: 'edit', item })}
                          onDelete={() => handleDelete(item)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {data && total > 0 && (
          <div className="mt-4 flex flex-col items-center gap-3 text-sm text-slate-500 sm:flex-row sm:justify-between">
            <span>
              {from}-{to} of {total}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {modal?.type === 'create' && (
        <ItemFormModal item={null} canEditCode onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {modal?.type === 'edit' && (
        <ItemFormModal
          item={modal.item}
          canEditCode={isAdmin}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {modal?.type === 'stock' && (
        <StockModal
          item={modal.item}
          initialType={modal.stockType}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {modal?.type === 'summary' && <SummaryModal item={modal.item} onClose={() => setModal(null)} />}
    </div>
  )
}