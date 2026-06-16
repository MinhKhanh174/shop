import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useHomeData } from '../../hooks/useHomeData'
import { getViewedProducts } from '../../utils/viewedProducts'
import { SectionHeading } from '../../shared/ui/SectionHeading'
import { CategoryBreadcrumb } from '../category/components/CategoryBreadcrumb'
import { CategoryEmptyState } from '../category/components/CategoryEmptyState'
import { CategoryProductGrid } from '../category/components/CategoryProductGrid'
import { CategorySidebar } from '../category/components/CategorySidebar'
import { CategorySortBar } from '../category/components/CategorySortBar'
import { ViewedProductsSection } from '../category/components/ViewedProductsSection'
import { VoucherSection } from '../home/sections/VoucherSection'
import { useProductSearchResults } from './hooks/useProductSearchResults.js'
import {
  buildBrandOptions,
  buildPaginationPages,
  dedupeProducts,
  getCollectionMeta,
  getVisibleProducts,
  mapRemoteProduct,
  matchesPriceRange,
  sortProducts,
} from './productList.utils'

const PAGE_SIZE = 12

export default function ProductListPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const { products: remoteProducts, loading: remoteLoading } = useHomeData()
  const { searchResults, loading: searchLoading, error: searchError } = useProductSearchResults(query)

  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedPriceRange, setSelectedPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (searchError) {
      toast.error('Không thể tìm kiếm sản phẩm')
    }
  }, [searchError])

  useEffect(() => {
    setCurrentPage(1)
  }, [query])

  const baseProducts = useMemo(() => {
    const sourceProducts = query ? searchResults : remoteProducts
    const mappedProducts = sourceProducts.map(mapRemoteProduct)

    return dedupeProducts(mappedProducts)
  }, [query, remoteProducts, searchResults])

  const brandOptions = useMemo(() => buildBrandOptions(baseProducts), [baseProducts])
  const collectionMeta = useMemo(() => getCollectionMeta(query), [query])

  const filteredProducts = useMemo(() => {
    const byBrand =
      selectedBrands.length > 0
        ? baseProducts.filter((product) => selectedBrands.includes(product.brand))
        : baseProducts

    const byPrice = byBrand.filter((product) => matchesPriceRange(product, selectedPriceRange))

    return sortProducts(byPrice, sortBy)
  }, [baseProducts, selectedBrands, selectedPriceRange, sortBy])

  const { totalPages, safeCurrentPage, visibleProducts } = useMemo(
    () => getVisibleProducts(filteredProducts, currentPage, PAGE_SIZE),
    [currentPage, filteredProducts],
  )
  const isFilteredEmpty = baseProducts.length > 0 && filteredProducts.length === 0
  const viewedProducts = useMemo(() => getViewedProducts(baseProducts, 4), [baseProducts])
  const paginationPages = useMemo(() => buildPaginationPages(totalPages, safeCurrentPage), [safeCurrentPage, totalPages])

  const handleToggleBrand = (brand) => {
    setSelectedBrands((current) =>
      current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand],
    )
    setCurrentPage(1)
  }

  const handlePriceRangeChange = (value) => {
    setSelectedPriceRange(value)
    setCurrentPage(1)
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setSelectedBrands([])
    setSelectedPriceRange('all')
    setSortBy('newest')
    setCurrentPage(1)
  }

  const handleGoToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  if ((!query && remoteLoading) || (query && searchLoading)) {
    return <div className="page-loader">Đang tải danh sách sản phẩm...</div>
  }

  return (
    <div className="category-page">
      <CategoryBreadcrumb label={collectionMeta.label} />
      <VoucherSection />

      <div className="category-page__layout">
        <CategorySidebar
          brands={brandOptions}
          selectedBrands={selectedBrands}
          selectedPriceRange={selectedPriceRange}
          onToggleBrand={handleToggleBrand}
          onPriceRangeChange={handlePriceRangeChange}
          onReset={handleResetFilters}
          totalCount={baseProducts.length}
        />

        <div className="category-page__content">
          <div className="category-page__title-block">
            <h1>{collectionMeta.label}</h1>
          </div>

          <CategorySortBar sortBy={sortBy} onSortByChange={handleSortChange} />

          {isFilteredEmpty ? (
            <CategoryEmptyState
              title="Không tìm thấy sản phẩm phù hợp"
              description="Không có sản phẩm nào trong danh sách hiện tại khớp với bộ lọc đã chọn."
              onReset={handleResetFilters}
            />
          ) : (
            <>
              <CategoryProductGrid products={visibleProducts} />

              {totalPages > 1 ? (
                <div className="category-page__pagination" aria-label="Chuyển trang">
                  {safeCurrentPage > 1 ? (
                    <button
                      type="button"
                      className="category-page__page category-page__page--arrow"
                      onClick={() => handleGoToPage(safeCurrentPage - 1)}
                      aria-label="Trang trước"
                    >
                      ‹
                    </button>
                  ) : null}

                  {paginationPages.map((page, index) => {
                    const previousPage = paginationPages[index - 1]
                    const showEllipsis = index > 0 && page - previousPage > 1

                    return (
                      <span key={page}>
                        {showEllipsis ? <span className="category-page__ellipsis">...</span> : null}
                        <button
                          type="button"
                          className={`category-page__page${safeCurrentPage === page ? ' is-active' : ''}`}
                          onClick={() => handleGoToPage(page)}
                          aria-current={safeCurrentPage === page ? 'page' : undefined}
                        >
                          {page}
                        </button>
                      </span>
                    )
                  })}

                  {safeCurrentPage < totalPages ? (
                    <button
                      type="button"
                      className="category-page__page category-page__page--arrow"
                      onClick={() => handleGoToPage(safeCurrentPage + 1)}
                      aria-label="Trang tiếp theo"
                    >
                      ›
                    </button>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <section className="category-page__description section">
        <SectionHeading title="Mô tả danh sách sản phẩm" />
        <p>{collectionMeta.description}</p>
        <p>
          Hiện có {baseProducts.length} sản phẩm trong danh sách chung. Bạn có thể lọc theo thương hiệu, giá và sắp xếp
          theo nhu cầu mua sắm.
        </p>
      </section>

      <ViewedProductsSection products={viewedProducts} />
    </div>
  )
}
