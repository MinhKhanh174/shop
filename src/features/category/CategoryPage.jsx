import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { phoneAccessoriesProducts, soundProducts } from '../../data/homeData'
import { useHomeData } from '../../hooks/useHomeData'
import { SectionHeading } from '../../shared/ui/SectionHeading'
import { mapProductsToCards } from '../../utils/productMapper'
import {
  COLLECTION_ACCESSORIES_SLUG,
  COLLECTION_AUDIO_SLUG,
  COLLECTION_FEATURED_SLUG,
  COLLECTION_WATCH_SLUG,
  normalizeCollectionSlug,
} from '../../utils/categoryRoutes'
import { CategoryBreadcrumb } from './components/CategoryBreadcrumb'
import { CategoryEmptyState } from './components/CategoryEmptyState'
import { CategoryProductGrid } from './components/CategoryProductGrid'
import { CategorySidebar } from './components/CategorySidebar'
import { CategorySkeleton } from './components/CategorySkeleton'
import { CategorySortBar } from './components/CategorySortBar'
import { ViewedProductsSection } from './components/ViewedProductsSection'
import { VoucherSection } from '../home/sections/VoucherSection'
import { useViewedProducts } from '../product/hooks/useViewedProducts'
import {
  buildBrandOptions,
  buildPaginationPages,
  dedupeProducts,
  getVisibleProducts,
  matchesPriceRange,
  sortProducts,
} from '../product/productList.utils'

const PAGE_SIZE = 12

const COLLECTION_META = {
  [COLLECTION_FEATURED_SLUG]: {
    label: 'Khuyến mãi hot',
    description: 'Tổng hợp các sản phẩm đang giảm giá nổi bật nhất hiện tại.',
  },
  smartphones: {
    label: 'Điện thoại',
    description: 'Các mẫu điện thoại nổi bật từ nhiều thương hiệu khác nhau.',
  },
  tablets: {
    label: 'Máy tính bảng',
    description: 'Máy tính bảng phục vụ học tập, làm việc và giải trí.',
  },
  laptops: {
    label: 'Laptop',
    description: 'Laptop cho học tập, văn phòng và nhu cầu hiệu năng cao.',
  },
  headphones: {
    label: 'Tai nghe',
    description: 'Tai nghe có dây, không dây và các thiết bị âm thanh liên quan.',
  },
  [COLLECTION_AUDIO_SLUG]: {
    label: 'Âm thanh',
    description: 'Tai nghe, loa và các thiết bị âm thanh đáng chú ý.',
  },
  [COLLECTION_WATCH_SLUG]: {
    label: 'Đồng hồ',
    description: 'Đồng hồ nam, đồng hồ nữ và smartwatch được chọn lọc.',
  },
  [COLLECTION_ACCESSORIES_SLUG]: {
    label: 'Phụ kiện',
    description: 'Cáp sạc, củ sạc, ốp lưng và phụ kiện điện thoại.',
  },
  'mobile-accessories': {
    label: 'Phụ kiện điện thoại',
    description: 'Phụ kiện điện thoại nổi bật và dễ mua nhất.',
  },
}

function getDiscountValue(product) {
  const sourceDiscount = Number(product?.source?.discountPercentage)
  if (!Number.isNaN(sourceDiscount) && sourceDiscount > 0) {
    return sourceDiscount
  }

  const badgeValue = String(product?.badge ?? '')
    .replace('%', '')
    .replace('-', '')

  const parsedBadge = Number(badgeValue)
  return Number.isNaN(parsedBadge) ? 0 : parsedBadge
}

function resolveCollectionMeta(categorySlug, categoryItems) {
  const matchedItem = categoryItems.find((item) => item.key === categorySlug)
  const staticMeta = COLLECTION_META[categorySlug] ?? null

  if (matchedItem) {
    return {
      label: matchedItem.sidebarLabel,
      description: `Khám phá toàn bộ sản phẩm thuộc danh mục ${matchedItem.sidebarLabel.toLowerCase()}.`,
    }
  }

  if (staticMeta) {
    return staticMeta
  }

  const fallbackLabel = categorySlug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    label: fallbackLabel || 'Danh mục sản phẩm',
    description: 'Khám phá toàn bộ sản phẩm trong danh mục này.',
  }
}

function buildCollectionCards(categorySlug, remoteProducts) {
  const remoteCards = mapProductsToCards(Array.isArray(remoteProducts) ? remoteProducts : [], {
    label: 'Trả góp 0%',
  })

  if (categorySlug === COLLECTION_FEATURED_SLUG) {
    return dedupeProducts(remoteCards.filter((product) => getDiscountValue(product) > 0))
  }

  if (categorySlug === COLLECTION_AUDIO_SLUG || categorySlug === 'audio') {
    const fallbackCards = soundProducts.map((product) => ({
      ...product,
      category: 'audio',
    }))

    return dedupeProducts([
      ...remoteCards.filter((product) => product.category === 'headphones' || product.category === 'speakers'),
      ...fallbackCards,
    ])
  }

  if (categorySlug === COLLECTION_WATCH_SLUG || categorySlug === 'watch') {
    return dedupeProducts(
      remoteCards.filter(
        (product) => product.category === 'mens-watches' || product.category === 'womens-watches',
      ),
    )
  }

  if (categorySlug === COLLECTION_ACCESSORIES_SLUG || categorySlug === 'accessories') {
    const fallbackCards = phoneAccessoriesProducts.map((product) => ({
      ...product,
      category: 'accessories',
    }))

    return dedupeProducts([
      ...remoteCards.filter(
        (product) => product.category === 'mobile-accessories' || product.category === 'computer-accessories',
      ),
      ...fallbackCards,
    ])
  }

  return dedupeProducts(remoteCards.filter((product) => product.category === categorySlug))
}

function CategoryCollectionView({ collectionMeta, collectionProducts }) {
  const brandOptions = useMemo(() => buildBrandOptions(collectionProducts), [collectionProducts])

  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedPriceRange, setSelectedPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredProducts = useMemo(() => {
    const byBrand =
      selectedBrands.length > 0
        ? collectionProducts.filter((product) => selectedBrands.includes(product.brand))
        : collectionProducts

    const byPrice = byBrand.filter((product) => matchesPriceRange(product, selectedPriceRange))

    return sortProducts(byPrice, sortBy)
  }, [collectionProducts, selectedBrands, selectedPriceRange, sortBy])

  const { totalPages, safeCurrentPage, visibleProducts } = useMemo(
    () => getVisibleProducts(filteredProducts, currentPage, PAGE_SIZE),
    [currentPage, filteredProducts],
  )
  const isFilteredEmpty = collectionProducts.length > 0 && filteredProducts.length === 0
  const paginationPages = useMemo(() => buildPaginationPages(totalPages, safeCurrentPage), [safeCurrentPage, totalPages])

  const viewedProducts = useViewedProducts(4)

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
          totalCount={collectionProducts.length}
        />

        <div className="category-page__content">
          <div className="category-page__title-block">
            <h1>{collectionMeta.label}</h1>
          </div>

          <CategorySortBar sortBy={sortBy} onSortByChange={handleSortChange} />

          {isFilteredEmpty ? (
            <CategoryEmptyState
              title="Không tìm thấy sản phẩm phù hợp"
              description={`Không có sản phẩm nào trong danh mục ${collectionMeta.label} khớp với bộ lọc hiện tại.`}
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
                      <ChevronLeft size={16} />
                    </button>
                  ) : null}

                  {paginationPages.map((page, index) => {
                    const previousPage = paginationPages[index - 1]
                    const showEllipsis = index > 0 && page - previousPage > 1

                    return (
                      <span key={page}>
                        {showEllipsis ? <span className="category-page__ellipsis">…</span> : null}
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
                      <ChevronRight size={16} />
                    </button>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <section className="category-page__description section">
        <SectionHeading title="Mô tả nhóm sản phẩm" />
        <p>{collectionMeta.description}</p>
        <p>
          Hiện đang có {collectionProducts.length} sản phẩm trong danh mục này. Bạn có thể lọc theo thương hiệu, giá và
          sắp xếp theo nhu cầu mua sắm.
        </p>
      </section>

      <ViewedProductsSection products={viewedProducts} variant="grid" />
    </div>
  )
}

export default function CategoryPage() {
  const { categorySlug: rawCategorySlug = '' } = useParams()
  const categorySlug = normalizeCollectionSlug(rawCategorySlug)
  const { products: remoteProducts = [], categoryItems = [], loading } = useHomeData()

  const collectionMeta = useMemo(() => resolveCollectionMeta(categorySlug, categoryItems), [categoryItems, categorySlug])
  const collectionProducts = useMemo(
    () => buildCollectionCards(categorySlug, remoteProducts),
    [categorySlug, remoteProducts],
  )

  if (loading) {
    return <CategorySkeleton />
  }

  return (
    <CategoryCollectionView
      key={categorySlug}
      collectionMeta={collectionMeta}
      collectionProducts={collectionProducts}
    />
  )
}
