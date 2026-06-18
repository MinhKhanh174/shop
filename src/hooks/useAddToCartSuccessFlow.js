import { createElement, useCallback, useState } from 'react'
import { formatCurrency } from '../utils/currency'
import { useCartStore } from '../store/useCartStore'
import { AddToCartSuccessModal } from '../shared/ui/AddToCartSuccessModal'

function buildSuccessPayload(product, quantity) {
  const cartItems = useCartStore.getState().cartItems
  const cartTotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0)
  const cartCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)

  return {
    id: product.id,
    name: product.name ?? product.title ?? 'Sản phẩm',
    image: product.image ?? product.thumbnail ?? product.images?.[0] ?? null,
    variant: quantity > 1 ? `Số lượng: ${quantity}` : product.label ?? '',
    cartTotalText: formatCurrency(cartTotal),
    cartCountText: `(${cartCount}) sản phẩm`,
  }
}

export function useAddToCartSuccessFlow() {
  const addToCart = useCartStore((state) => state.addToCart)
  const [successPayload, setSuccessPayload] = useState(null)

  const closeSuccessModal = useCallback(() => {
    setSuccessPayload(null)
  }, [])

  const handleAddToCart = useCallback(
    (product, options = {}) => {
      if (!product) return

      const quantity = Math.max(1, Math.floor(Number(options.quantity) || 1))
      addToCart(product, quantity)
      setSuccessPayload(buildSuccessPayload(product, quantity))
    },
    [addToCart],
  )

  const successModal = createElement(AddToCartSuccessModal, {
    open: Boolean(successPayload),
    item: successPayload,
    cartTotalText: successPayload?.cartTotalText ?? '',
    cartCountText: successPayload?.cartCountText ?? '',
    onClose: closeSuccessModal,
  })

  return {
    handleAddToCart,
    successPayload,
    closeSuccessModal,
    successModal,
  }
}
