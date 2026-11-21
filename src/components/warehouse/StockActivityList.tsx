import { UOM_LABELS, formatQuantity } from '../../services/items/itemService'
import type { StockMovement } from '../../services/items/itemService'

type Props = {
  movements: StockMovement[]
  perItem: boolean
}

type Group = { key: string; label: string; movements: StockMovement[] }

function groupByDay(movements: StockMovement[]): Group[] {
  const groups: Group[] = []
  for (const m of movements) {
    const date = new Date(m.createdAt)
    const key = date.toDateString()
    let group = groups[groups.length - 1]
    if (!group || group.key !== key) {
      group = {
        key,
        label: date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }),
        movements: [],
      }
      groups.push(group)
    }
    group.movements.push(m)
  }
  return groups
}

const sum = (list: StockMovement[]) => list.reduce((total, m) => total + m.quantity, 0)

export default function StockActivityList({ movements, perItem }: Props) {
  if (movements.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-500">No stock changes in this period.</p>
  }

  return (
    <div className="space-y-6">
      {groupByDay(movements).map((group) => {
        const added = group.movements.filter((m) => m.type === 'IN')
        const removed = group.movements.filter((m) => m.type === 'OUT')
        const unit = UOM_LABELS[group.movements[0].uom]

        return (
          <section key={group.key}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h3 className="text-sm font-semibold text-navy-800">{group.label}</h3>
              <p className="text-xs text-slate-500">
                {perItem
                  ? `+${formatQuantity(sum(added))} / -${formatQuantity(sum(removed))} ${unit}`
                  : `${added.length} added · ${removed.length} removed`}
              </p>
            </div>

            <ul className="space-y-3">
              {group.movements.map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {!perItem && (
                      <>
                        <p className="font-mono text-xs text-slate-800">{m.itemCode}</p>
                        <p className="line-clamp-1 text-sm text-slate-600" title={m.itemDescription}>
                          {m.itemDescription}
                        </p>
                      </>
                    )}
                    <p className="text-xs text-slate-400">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      {m.changedByName}
                      {m.note ? ` · ${m.note}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-semibold ${m.type === 'IN' ? 'text-green-700' : 'text-red-600'}`}>
                      {m.type === 'IN' ? '+' : '-'}
                      {formatQuantity(m.quantity)} {UOM_LABELS[m.uom]}
                    </p>
                    <p className="text-xs text-slate-400">Balance {formatQuantity(m.balanceAfter)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}