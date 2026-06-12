import { useEffect, useState } from 'react'
import { getProductById } from '../../../services/productService.js'

export function useProductDetail(productId) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    getProductById(productId)
      .then((result) => {
        if (active) {
          setProduct(result)
          setLoading(false)
          setError(null)
        }
      })
      .catch((err) => {
        if (active) {
          setProduct(null)
          setLoading(false)
          setError(err)
        }
      })

    return () => {
      active = false
    }
  }, [productId])

  return {
    product,
    loading,
    error,
  }
}
