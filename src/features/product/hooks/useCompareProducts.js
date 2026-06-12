import { useEffect, useState } from 'react'
import { getCompareProducts } from '../../../services/productService.js'

export function useCompareProducts(ids) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    getCompareProducts(ids)
      .then((result) => {
        if (active) {
          setProducts(result)
          setLoading(false)
          setError(null)
        }
      })
      .catch((err) => {
        if (active) {
          setProducts([])
          setLoading(false)
          setError(err)
        }
      })

    return () => {
      active = false
    }
  }, [ids])

  return {
    products,
    loading,
    error,
  }
}
