import { useState } from 'react'
import type { FormEvent } from 'react'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import { UOM_LABELS, UOM_OPTIONS, createItem, updateItem } from '../../services/items/itemService'
import type { Item, Uom } from '../../services/items/itemService'

type Props = {
  item: Item | null
  canEditCode: boolean
  onClose: () => void
  onSaved: (message: string) => void
}

type Errors = { itemCode?: string; description?: string; uom?: string; quantity?: string }

const fieldClass = (hasError: boolean) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-navy-500/30 ${
    hasError ? 'border-red-400' : 'border-slate-300 focus:border-navy-500'
  }`

export default function ItemFormModal({ item, canEditCode, onClose, onSaved }: Props) {
  const isEdit = item !== null
  const [code, setCode] = useState(item?.itemCode ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [uom, setUom] = useState<Uom | ''>(item?.uom ?? '')
  const [opening, setOpening] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const validate = () => {
    const e: Errors = {}
    const c = code.trim()
    if (!c) e.itemCode = 'Item code is required'
    else if (/\s/.test(c)) e.itemCode = 'Item code cannot contain spaces'
    else if (c.length > 50) e.itemCode = 'Item code must be 50 characters or fewer'
    if (!description.trim()) e.description = 'Description is required'
    else if (description.trim().length > 500) e.description = 'Description must be 500 characters or fewer'
    if (!uom) e.uom = 'Select a UOM'
    if (!isEdit && opening.trim() !== '') {
      const n = Number(opening)
      if (!Number.isInteger(n) || n < 0) e.quantity = 'Enter a whole number, 0 or more'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    setFormError('')
    if (!validate() || !uom) return
    setSaving(true)
    try {
      if (item) {
        await updateItem(item.id, {
          itemCode: canEditCode ? code.trim() : undefined,
          description: description.trim(),
          uom,
        })
        onSaved(`${item.itemCode} was updated.`)
      } else {
        const created = await createItem({
          itemCode: code.trim(),
          description: description.trim(),
          uom,
          quantity: opening.trim() === '' ? 0 : Number(opening),
        })
        onSaved(`${created.itemCode} was added.`)
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={isEdit ? 'Edit item' : 'Add item'} onClose={onClose}>
      {formError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <Input
            id="itemCode"
            label="Item code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={errors.itemCode}
            disabled={isEdit && !canEditCode}
          />
          {isEdit && !canEditCode && (
            <p className="mt-1 text-xs text-slate-500">Only an admin can change the item code.</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={fieldClass(!!errors.description)}
          />
          <div className="mt-1 flex justify-between text-xs">
            <span className="text-red-600">{errors.description}</span>
            <span className="text-slate-400">{description.length}/500</span>
          </div>
        </div>

        <div>
          <label htmlFor="uom" className="mb-1.5 block text-sm font-medium text-slate-700">
            UOM
          </label>
          <select
            id="uom"
            value={uom}
            onChange={(e) => setUom(e.target.value as Uom | '')}
            className={fieldClass(!!errors.uom)}
          >
            <option value="">Select UOM</option>
            {UOM_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {UOM_LABELS[u]}
              </option>
            ))}
          </select>
          {errors.uom && <p className="mt-1 text-xs text-red-600">{errors.uom}</p>}
        </div>

        {!isEdit && (
          <Input
            id="opening"
            label="Opening stock (optional)"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={opening}
            onChange={(e) => setOpening(e.target.value)}
            error={errors.quantity}
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? 'Save changes' : 'Add item'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}