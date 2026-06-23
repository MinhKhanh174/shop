import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { MAX_COMPARE_ITEMS, useCompareStore } from '../store/useCompareStore'
import { getCompareSuccessMessage } from '../shared/product/productActionUtils'

export function useCompareActions() {
  const addToCompare = useCompareStore((state) => state.addToCompare)
  const compareItems = useCompareStore((state) => state.compareItems)

  const addToCompareAndNotify = useCallback(
    (product) => {
      if (!product) return

      const exists = compareItems.some((item) => String(item.id) === String(product.id))
      if (!exists && compareItems.length >= MAX_COMPARE_ITEMS) {
        toast.error(`Chỉ được so sánh tối đa ${MAX_COMPARE_ITEMS} sản phẩm`)
        return
      }

      addToCompare(product)
      toast.success(getCompareSuccessMessage(product))
    },
    [addToCompare, compareItems],
  )

  return {
    addToCompare,
    addToCompareAndNotify,
  }
}
