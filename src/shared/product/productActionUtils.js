import { formatCurrency } from '../../utils/currency'
import { useCartStore } from '../../store/useCartStore'

export function getProductDisplayName(product) {
  return product?.name ?? product?.title ?? 'Sản phẩm'
}

export function getProductImage(product) {
  return product?.image ?? product?.thumbnail ?? product?.images?.[0] ?? null
}

export function getCartTotals(cartItems) {
  const total = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0)
  const count = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)

  return { total, count }
}

export function buildAddToCartSuccessPayload(product, { quantity = 1, variant = '', image } = {}) {
  const cartItems = useCartStore.getState().cartItems
  const { total, count } = getCartTotals(cartItems)
  const unitPrice = Number(product?.price) || 0
  const selectedQuantity = Math.max(1, Math.floor(Number(quantity) || 1))
  const selectedTotal = unitPrice * selectedQuantity

  return {
    id: product?.id,
    name: getProductDisplayName(product),
    image: image ?? getProductImage(product),
    variant: variant || (quantity > 1 ? `Số lượng: ${quantity}` : product?.label ?? ''),
    quantity: selectedQuantity,
    unitPriceText: formatCurrency(unitPrice),
    lineTotalText: formatCurrency(selectedTotal),
    cartTotalText: formatCurrency(total),
    cartCountText: `(${count}) sản phẩm`,
  }
}

export function getCompareSuccessMessage(product) {
  return `Đã thêm ${getProductDisplayName(product)} vào so sánh`
}
