import { useMemo } from 'react'
import { calculateCartTotals } from '../services/cartService'
import { formatCurrency } from '../utils/currency'
import { useCartStore } from '../store/useCartStore'

export function useCart() {
  const cartItems = useCartStore((state) => state.cartItems)
  const addToCart = useCartStore((state) => state.addToCart)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const totalPrice = useMemo(() => formatCurrency(calculateCartTotals(cartItems)), [cartItems])
  const itemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  )

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalPrice,
    itemCount,
  }
}
