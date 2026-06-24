import { useEffect, useState } from 'react'
import { fetchProducts, fetchProductCategories, fetchProductCategoryList } from '../services/homeApi'
import { getRemoteBrands } from '../utils/productMapper'

const DEFAULT_QUERY = {
  limit: 100,
  select: 'id,title,price,discountPercentage,brand,category,thumbnail,images,stock,rating',
}

const NEXT_QUERY = {
  skip: 100,
  limit: 100,
  select: 'id,title,price,discountPercentage,brand,category,thumbnail,images,stock,rating',
}

function mergeProducts(firstPage, secondPage) {
  const productsById = new Map()

  ;[...firstPage, ...secondPage].forEach((product) => {
    if (product && typeof product.id !== 'undefined') {
      productsById.set(product.id, product)
    }
  })

  return Array.from(productsById.values())
}

function mergeCategories(categoryObjects, categoryList) {
  const categoriesBySlug = new Map()

  ;(Array.isArray(categoryObjects) ? categoryObjects : []).forEach((category) => {
    const slug = String(category?.slug ?? '').trim()
    if (!slug) {
      return
    }

    categoriesBySlug.set(slug, category)
  })

  ;(Array.isArray(categoryList) ? categoryList : []).forEach((category) => {
    const slug = String(category?.slug ?? category ?? '').trim()
    if (!slug || categoriesBySlug.has(slug)) {
      return
    }

    categoriesBySlug.set(slug, {
      slug,
      name: slug,
      url: `/products/category/${encodeURIComponent(slug)}`,
    })
  })

  return Array.from(categoriesBySlug.values())
}

export function useHomeContent(refreshToken = 0) {
  const [remote, setRemote] = useState({
    products: [],
    brands: [],
    categories: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let active = true
    const loadingTimer = setTimeout(() => {
      if (!active) {
        return
      }

      setRemote((current) => ({
        ...current,
        loading: true,
        error: null,
      }))
    }, 0)

    Promise.all([
      fetchProducts(DEFAULT_QUERY),
      fetchProducts(NEXT_QUERY),
      fetchProductCategories(),
      fetchProductCategoryList(),
    ])
      .then(([firstPageResponse, secondPageResponse, categoriesResponse, categoryListResponse]) => {
        if (!active) {
          return
        }

        clearTimeout(loadingTimer)

        const firstPageProducts = Array.isArray(firstPageResponse.data?.products)
          ? firstPageResponse.data.products
          : []
        const secondPageProducts = Array.isArray(secondPageResponse.data?.products)
          ? secondPageResponse.data.products
          : []
        const categories = mergeCategories(
          Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [],
          Array.isArray(categoryListResponse.data) ? categoryListResponse.data : [],
        )
        const mergedProducts = mergeProducts(firstPageProducts, secondPageProducts)

        setRemote({
          products: mergedProducts,
          brands: getRemoteBrands(mergedProducts),
          categories,
          loading: false,
          error: null,
        })
      })
      .catch((error) => {
        if (!active) {
          return
        }

        clearTimeout(loadingTimer)

        setRemote({
          products: [],
          brands: [],
          categories: [],
          loading: false,
          error,
        })
      })

    return () => {
      active = false
      clearTimeout(loadingTimer)
    }
  }, [refreshToken])

  return remote
}
