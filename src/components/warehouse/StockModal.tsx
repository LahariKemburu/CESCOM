import { useState } from 'react'
import type { FormEvent } from 'react'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import { UOM_LABELS, adjustStock, formatQuantity } from '../../services/items/itemService'
import type { Item, StockType } from '../../services/items/itemService'

type Props = {
  item: Item
  initialType: StockType
  onClose: () => void
  onSaved: (message: string) => void
}

export default function StockModal({ item, initialType, onClose, onSaved }: Props) {
  const [type, setType] = useState<StockType>(initialType)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [amountError, setAmountError] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const quantity = Number(amount)
  const validNumber = amount.trim() !== '' && Number.isInteger(quantity) && quantity >= 1
  const newBalance = validNumber ? (type === 'IN' ? item.quantity + quantity : item.quantity - quantity) : null
  const unit = UOM_LABELS[item.uom]

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    setFormError('')
    if (!validNumber) {
      setAmountError('Enter a whole number of 1 or more')
      return
    }
    if (type === 'OUT' && quantity > item.quantity) {
      setAmountError(`Only ${formatQuantity(item.quantity)} ${unit} available`)
      return
    }
    setAmountError('')
    setSaving(true)
    try {
      await adjustStock(item.id, type, quantity, note.trim() || undefined)
      onSaved(
        `${type === 'IN' ? 'Added' : 'Removed'} ${formatQuantity(quantity)} ${unit} ${
          type === 'IN' ? 'to' : 'from'
        } ${item.itemCode}.`,
      )
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const tabClass = (active: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
      active ? 'bg-navy-700 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
    }`

  return (
    <Modal title="Update stock" onClose={onClose}>
      <div className="mb-4 rounded-lg bg-slate-50 p-3">
        <p className="font-mono text-xs text-slate-800">{item.itemCode}</p>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description}</p>
        <p className="mt-2 text-sm text-slate-700">
          Current stock:{' '}
          <span className="font-semibold text-navy-800">
            {formatQuantity(item.quantity)} {unit}
          </span>
        </p>
      </div>

      {formError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="flex gap-2">
          <button type="button" className={tabClass(type === 'IN')} onClick={() => setType('IN')}>
            Increase
          </button>
          <button type="button" className={tabClass(type === 'OUT')} onClick={() => setType('OUT')}>
            Decrease
          </button>
        </div>

        <Input
          id="amount"
          label={`Quantity (${unit})`}
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={amountError}
        />

        {newBalance !== null && newBalance >= 0 && (
          <p className="text-sm text-slate-600">
            New stock:{' '}
            <span className="font-semibold text-navy-800">
              {formatQuantity(newBalance)} {unit}
            </span>
          </p>
        )}

        <Input
          id="note"
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {type === 'IN' ? 'Increase stock' : 'Decrease stock'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}