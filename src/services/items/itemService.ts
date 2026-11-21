import { gql } from '@apollo/client'
import { apolloClient } from '../graphql/client'

export type Uom = 'EACH' | 'METER' | 'KILOGRAM'
export type StockType = 'IN' | 'OUT'
export type StockFilter = 'IN_STOCK' | 'OUT_OF_STOCK'

export type Item = {
  id: string
  itemCode: string
  description: string
  uom: Uom
  quantity: number
}

export type ItemPage = {
  items: Item[]
  total: number
  page: number
  pageSize: number
}

export type ItemStats = {
  total: number
  inStock: number
  outOfStock: number
}

export type StockMovement = {
  id: string
  itemId: string
  itemCode: string
  itemDescription: string
  uom: Uom
  type: StockType
  quantity: number
  balanceAfter: number
  note: string | null
  changedByName: string
  createdAt: string
}

export type StockSummary = {
  days: number
  inQuantity: number
  outQuantity: number
  inCount: number
  outCount: number
  movements: StockMovement[]
}

export type ItemFilters = {
  search: string
  uom: Uom | ''
  stock: StockFilter | ''
  page: number
  pageSize: number
}

export const UOM_OPTIONS: Uom[] = ['EACH', 'METER', 'KILOGRAM']

export const UOM_LABELS: Record<Uom, string> = {
  EACH: 'Each',
  METER: 'Meter',
  KILOGRAM: 'Kilogram',
}

export const formatQuantity = (n: number) => n.toLocaleString()

const ITEM_FIELDS = `
  id
  itemCode
  description
  uom
  quantity
`

const ITEMS = gql`
  query Items($search: String, $uom: Uom, $stock: StockFilter, $page: Int, $pageSize: Int) {
    items(search: $search, uom: $uom, stock: $stock, page: $page, pageSize: $pageSize) {
      total
      page
      pageSize
      items {
        ${ITEM_FIELDS}
      }
    }
  }
`

const ITEM_STATS = gql`
  query ItemStats {
    itemStats {
      total
      inStock
      outOfStock
    }
  }
`

const STOCK_SUMMARY = gql`
  query StockSummary($days: Int, $itemId: ID) {
    stockSummary(days: $days, itemId: $itemId) {
      days
      inQuantity
      outQuantity
      inCount
      outCount
      movements {
        id
        itemId
        itemCode
        itemDescription
        uom
        type
        quantity
        balanceAfter
        note
        changedByName
        createdAt
      }
    }
  }
`

const CREATE_ITEM = gql`
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) {
      ${ITEM_FIELDS}
    }
  }
`

const UPDATE_ITEM = gql`
  mutation UpdateItem($id: ID!, $input: UpdateItemInput!) {
    updateItem(id: $id, input: $input) {
      ${ITEM_FIELDS}
    }
  }
`

const ADJUST_STOCK = gql`
  mutation AdjustStock($id: ID!, $type: StockType!, $quantity: Int!, $note: String) {
    adjustStock(id: $id, type: $type, quantity: $quantity, note: $note) {
      ${ITEM_FIELDS}
    }
  }
`

const DELETE_ITEM = gql`
  mutation DeleteItem($id: ID!) {
    deleteItem(id: $id) {
      message
    }
  }
`

function toError(err: unknown, fallback: string) {
  const message = err instanceof Error ? err.message : ''
  if (message === 'Failed to fetch') return new Error('Cannot reach the server. Please try again.')
  return new Error(message || fallback)
}

export async function getItems(filters: ItemFilters): Promise<ItemPage> {
  try {
    const result = await apolloClient.query<{ items: ItemPage }>({
      query: ITEMS,
      variables: {
        search: filters.search || null,
        uom: filters.uom || null,
        stock: filters.stock || null,
        page: filters.page,
        pageSize: filters.pageSize,
      },
      fetchPolicy: 'network-only',
    })
    if (!result.data) throw new Error('Could not load items')
    return result.data.items
  } catch (err) {
    throw toError(err, 'Could not load items')
  }
}

export async function getItemStats(): Promise<ItemStats> {
  try {
    const result = await apolloClient.query<{ itemStats: ItemStats }>({
      query: ITEM_STATS,
      fetchPolicy: 'network-only',
    })
    if (!result.data) throw new Error('Could not load statistics')
    return result.data.itemStats
  } catch (err) {
    throw toError(err, 'Could not load statistics')
  }
}

export async function getStockSummary(days: number, itemId?: string): Promise<StockSummary> {
  try {
    const result = await apolloClient.query<{ stockSummary: StockSummary }>({
      query: STOCK_SUMMARY,
      variables: { days, itemId: itemId ?? null },
      fetchPolicy: 'network-only',
    })
    if (!result.data) throw new Error('Could not load the summary')
    return result.data.stockSummary
  } catch (err) {
    throw toError(err, 'Could not load the summary')
  }
}

export async function createItem(input: {
  itemCode: string
  description: string
  uom: Uom
  quantity: number
}): Promise<Item> {
  try {
    const result = await apolloClient.mutate<{ createItem: Item }>({
      mutation: CREATE_ITEM,
      variables: { input },
    })
    if (!result.data) throw new Error('Could not add the item')
    return result.data.createItem
  } catch (err) {
    throw toError(err, 'Could not add the item')
  }
}

export async function updateItem(
  id: string,
  input: { itemCode?: string; description?: string; uom?: Uom },
): Promise<Item> {
  try {
    const result = await apolloClient.mutate<{ updateItem: Item }>({
      mutation: UPDATE_ITEM,
      variables: { id, input },
    })
    if (!result.data) throw new Error('Could not save the item')
    return result.data.updateItem
  } catch (err) {
    throw toError(err, 'Could not save the item')
  }
}

export async function adjustStock(
  id: string,
  type: StockType,
  quantity: number,
  note?: string,
): Promise<Item> {
  try {
    const result = await apolloClient.mutate<{ adjustStock: Item }>({
      mutation: ADJUST_STOCK,
      variables: { id, type, quantity, note: note ?? null },
    })
    if (!result.data) throw new Error('Could not update the stock')
    return result.data.adjustStock
  } catch (err) {
    throw toError(err, 'Could not update the stock')
  }
}

export async function deleteItem(id: string): Promise<string> {
  try {
    const result = await apolloClient.mutate<{ deleteItem: { message: string } }>({
      mutation: DELETE_ITEM,
      variables: { id },
    })
    return result.data?.deleteItem.message ?? 'Item deleted.'
  } catch (err) {
    throw toError(err, 'Could not delete the item')
  }
}