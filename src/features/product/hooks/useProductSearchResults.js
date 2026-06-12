import { useEffect, useState } from 'react'
import { searchCatalogProducts } from '../../../services/productService.js'

export function useProductSearchResults(query) {
  const [searchResults, setSearchResults] = useState([])
  const [error, setError] = useState(null)
  const [resolvedQuery, setResolvedQuery] = useState('')
  const trimmedQuery = String(query ?? '').trim()

  useEffect(() => {
    if (!trimmedQuery) {
      return undefined
    }

    let active = true

    searchCatalogProducts(trimmedQuery)
      .then((results) => {
        if (active) {
          setSearchResults(results)
          setError(null)
          setResolvedQuery(trimmedQuery)
        }
      })
      .catch((err) => {
        if (active) {
          setSearchResults([])
          setError(err)
          setResolvedQuery(trimmedQuery)
        }
      })

    return () => {
      active = false
    }
  }, [trimmedQuery])

  return {
    searchResults,
    error,
    loading: Boolean(trimmedQuery) && trimmedQuery !== resolvedQuery,
  }
}
