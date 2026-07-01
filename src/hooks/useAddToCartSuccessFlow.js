import { createElement, useCallback, useState } from 'react'
import { useCartStore } from '../store/useCartStore'
import { AddToCartSuccessModal } from '../shared/ui/AddToCartSuccessModal'
import { buildAddToCartSuccessPayload } from '../shared/product/productActionUtils'
import { clampQuantity } from '../utils/quantity'

export function useAddToCartSuccessFlow() {
  const addToCart = useCartStore((state) => state.addToCart)
  const [successPayload, setSuccessPayload] = useState(null)

  const closeSuccessModal = useCallback(() => {
    setSuccessPayload(null)
  }, [])

  const handleAddToCart = useCallback(
    (product, options = {}) => {
      if (!product) return

      const requestedQuantity = Math.max(1, Math.floor(Number(options.quantity) || 1))
      const quantity = clampQuantity(requestedQuantity, product?.stock ?? null)
      addToCart(product, quantity)
      setSuccessPayload(buildAddToCartSuccessPayload(product, { quantity }))
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
