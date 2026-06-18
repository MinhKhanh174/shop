import { useMemo } from 'react'
import { useHomeData } from '../../../hooks/useHomeData'
import { getViewedProducts } from '../../../utils/viewedProducts'
import { mapProductsToCards } from '../../../utils/productMapper'

export function useViewedProducts(limit = 4) {
  const { products: remoteProducts = [] } = useHomeData()

  return useMemo(() => {
    const catalogProducts = mapProductsToCards(remoteProducts, { label: 'Trả góp 0%' })
    return getViewedProducts(catalogProducts, limit)
  }, [limit, remoteProducts])
}
