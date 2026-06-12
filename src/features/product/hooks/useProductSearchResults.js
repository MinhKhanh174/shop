import { useEffect, useState } from 'react'
import { searchCatalogProducts } from '../../../services/productService.js'

export function useProductSearchResults(query) {
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    searchCatalogProducts(query)
      .then((results) => {
        if (active) {
          setSearchResults(results)
          setLoading(false)
          setError(null)
        }
      })
      .catch((err) => {
        if (active) {
          setSearchResults([])
          setLoading(false)
          setError(err)
        }
      })

    return () => {
      active = false
    }
  }, [query])

  return {
    searchResults,
    error,
    loading,
  }
}
