export * from './utils'
export * from './format'

/**
 * Shared order & pricing calculation helpers.
 */
export function calculateOrderTotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function calculateTax(subtotal: number, taxRate = 0.08): number {
  return Number((subtotal * taxRate).toFixed(2))
}
