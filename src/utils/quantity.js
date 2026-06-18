export function resolveMaxQuantity(value) {
  const max = Number(value)

  if (!Number.isFinite(max) || max <= 0) {
    return null
  }

  return Math.floor(max)
}

export function clampQuantity(quantity, maxQuantity = null) {
  const current = Math.max(1, Math.floor(Number(quantity) || 1))
  const max = resolveMaxQuantity(maxQuantity)

  if (max === null) {
    return current
  }

  return Math.min(current, max)
}
