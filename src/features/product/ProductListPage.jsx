import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useHomeData } from '../../hooks/useHomeData'
import { SectionHeading } from '../../shared/ui/SectionHeading'
import { CategoryBreadcrumb } from '../category/components/CategoryBreadcrumb'
import { CategoryEmptyState } from '../category/components/CategoryEmptyState'
import { CategoryProductGrid } from '../category/components/CategoryProductGrid'
import { CategorySidebar } from '../category/components/CategorySidebar'
import { CategorySortBar } from '../category/components/CategorySortBar'
import { ViewedProductsSection } from '../category/components/ViewedProductsSection'
import { VoucherSection } from '../home/sections/VoucherSection'
import { useProductSearchResults } from './hooks/useProductSearchResults.js'
import { useViewedProducts } from './hooks/useViewedProducts'
import {
  buildBrandOptions,
  buildColorOptions,
  buildPaginationPages,
  buildProductTypeOptions,
  dedupeProducts,
  getCollectionMeta,
  getVisibleProducts,
  mapRemoteProduct,
  matchesColorSelection,
  matchesProductTypeSelection,
  matchesPriceRange,
  sortProducts,
} from './productList.utils'

const PAGE_SIZE = 12

export default function ProductListPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''

  return <ProductListContent key={query} query={query} />
}

function ProductListContent({ query }) {
  const { products: remoteProducts, loading: remoteLoading } = useHomeData()
  const { searchResults, loading: searchLoading, error: searchError } = useProductSearchResults(query)

  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedProductTypes, setSelectedProductTypes] = useState([])
  const [selectedPriceRange, setSelectedPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (searchError) {
      toast.error('Không thể tìm kiếm sản phẩm')
    }
  }, [searchError])

  const baseProducts = useMemo(() => {
    const sourceProducts = query ? searchResults : remoteProducts
    const mappedProducts = sourceProducts.map(mapRemoteProduct)

    return dedupeProducts(mappedProducts)
  }, [query, remoteProducts, searchResults])

  const brandOptions = useMemo(() => buildBrandOptions(baseProducts), [baseProducts])
  const colorOptions = useMemo(() => buildColorOptions(baseProducts), [baseProducts])
  const productTypeOptions = useMemo(() => buildProductTypeOptions(baseProducts), [baseProducts])
  const collectionMeta = useMemo(() => getCollectionMeta(query), [query])

  const filteredProducts = useMemo(() => {
    const byBrand =
      selectedBrands.length > 0
        ? baseProducts.filter((product) => selectedBrands.includes(product.brand))
        : baseProducts

    const byColor = byBrand.filter((product) => matchesColorSelection(product, selectedColors))
    const byType = byColor.filter((product) => matchesProductTypeSelection(product, selectedProductTypes))
    const byPrice = byType.filter((product) => matchesPriceRange(product, selectedPriceRange))

    return sortProducts(byPrice, sortBy)
  }, [baseProducts, selectedBrands, selectedColors, selectedProductTypes, selectedPriceRange, sortBy])

  const { totalPages, safeCurrentPage, visibleProducts } = useMemo(
    () => getVisibleProducts(filteredProducts, currentPage, PAGE_SIZE),
    [currentPage, filteredProducts],
  )
  const isFilteredEmpty = baseProducts.length > 0 && filteredProducts.length === 0
  const viewedProducts = useViewedProducts(4)
  const paginationPages = useMemo(() => buildPaginationPages(totalPages, safeCurrentPage), [safeCurrentPage, totalPages])

  const handleToggleBrand = (brand) => {
    setSelectedBrands((current) =>
      current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand],
    )
    setCurrentPage(1)
  }

  const handleToggleColor = (color) => {
    setSelectedColors((current) => (current.includes(color) ? current.filter((item) => item !== color) : [...current, color]))
    setCurrentPage(1)
  }

  const handleToggleProductType = (type) => {
    setSelectedProductTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
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
    setSelectedColors([])
    setSelectedProductTypes([])
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
          colors={colorOptions}
          selectedColors={selectedColors}
          selectedPriceRange={selectedPriceRange}
          productTypes={productTypeOptions}
          selectedProductTypes={selectedProductTypes}
          onToggleBrand={handleToggleBrand}
          onToggleColor={handleToggleColor}
          onToggleProductType={handleToggleProductType}
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

      <ViewedProductsSection products={viewedProducts} variant="grid" />
    </div>
  )
}

