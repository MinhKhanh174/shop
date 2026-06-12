import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BadgeCheck, ShieldCheck, Star, Truck } from 'lucide-react'
import { useHomeData } from '../hooks/useHomeData'
import { useCart } from '../hooks/useCart'
import { SectionHeading } from '../shared/ui/SectionHeading'
import Card from '../shared/ui/Card'
import { ROUTES } from '../config/routes'
import { formatCurrency } from '../utils/formatCurrency'
import { mapProductsToCards } from '../utils/productMapper'
import { getViewedProducts, saveViewedProductId } from '../utils/viewedProducts'
import { getCategoryCollectionPath } from '../utils/categoryRoutes'
import { ProductBreadcrumb } from '../components/product-detail/ProductBreadcrumb'
import { ProductGallery } from '../components/product-detail/ProductGallery'
import { ProductInfoPanel } from '../components/product-detail/ProductInfoPanel'
import { ProductPromoSidebar } from '../components/product-detail/ProductPromoSidebar'
import { RelatedProductsSection } from '../components/product-detail/RelatedProductsSection'
import { ProductSkeleton } from '../components/product-detail/ProductSkeleton'
import { ViewedProductsSection } from '../features/category/components/ViewedProductsSection'
import { useProductDetail } from '../features/product/hooks/useProductDetail'

function buildCategoryLabel(categorySlug, categoryItems) {
  const matched = categoryItems.find((item) => item.key === categorySlug)
  if (matched?.sidebarLabel) {
    return matched.sidebarLabel
  }

  return String(categorySlug || '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function ProductDetailContent({ productId }) {
  const { product, loading } = useProductDetail(productId)
  const { products: remoteProducts = [], categoryItems = [] } = useHomeData()
  const { addToCart } = useCart()

  useEffect(() => {
    if (product) {
      saveViewedProductId(product.id)
    }
  }, [product])

  const relatedProducts = useMemo(() => {
    if (!product) {
      return []
    }

    const currentCategory = String(product.source?.category ?? '').toLowerCase()
    const currentBrand = String(product.brand ?? '').toLowerCase()
    const mappedProducts = mapProductsToCards(remoteProducts, { label: 'Trả góp 0%' })

    return mappedProducts
      .filter((item) => String(item.id) !== String(product.id))
      .filter((item) => {
        const itemCategory = String(item.category ?? '').toLowerCase()
        const itemBrand = String(item.brand ?? '').toLowerCase()

        return itemCategory === currentCategory || itemBrand === currentBrand
      })
      .slice(0, 8)
  }, [product, remoteProducts])

  const viewedProducts = useMemo(() => {
    if (!remoteProducts.length) {
      return []
    }

    return getViewedProducts(mapProductsToCards(remoteProducts, { label: 'Trả góp 0%' }), 4).filter(
      (item) => String(item.id) !== String(product?.id ?? ''),
    )
  }, [product?.id, remoteProducts])

  if (loading) {
    return <ProductSkeleton />
  }

  if (!product) {
    return (
      <div className="space-y-6 py-4">
        <ProductBreadcrumb
          items={[
            { label: 'Trang chủ', to: '/' },
            { label: 'Sản phẩm', to: ROUTES.PRODUCTS },
            { label: 'Không tìm thấy' },
          ]}
        />
        <Card className="p-10 text-center">
          <p className="text-lg font-semibold text-slate-900">Sản phẩm không tồn tại</p>
          <Link
            to={ROUTES.PRODUCTS}
            className="mt-4 inline-flex rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Quay về danh sách
          </Link>
        </Card>
      </div>
    )
  }

  const categoryLabel = buildCategoryLabel(String(product.source?.category ?? ''), categoryItems)
  const discountPercentage = Number(product.source?.discountPercentage ?? 0)
  const oldPrice =
    discountPercentage > 0 ? Math.round(Number(product.price) / (1 - discountPercentage / 100)) : null

  return (
    <div className="space-y-8 py-4">
      <ProductBreadcrumb
        items={[
          { label: 'Trang chủ', to: '/' },
          { label: categoryLabel, to: getCategoryCollectionPath(String(product.source?.category ?? '')) },
          { label: product.name },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_320px]">
        <ProductGallery product={product} />

        <ProductInfoPanel
          product={product}
          categoryLabel={categoryLabel}
          oldPrice={oldPrice}
          formatCurrency={formatCurrency}
          onAddToCart={() => addToCart(product)}
        />

        <ProductPromoSidebar />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
        <Card className="p-6 sm:p-8">
          <SectionHeading title="Đặc điểm nổi bật" />
          <div className="space-y-4 text-sm leading-7 text-slate-600">
            <p className="text-base text-slate-700">{product.description}</p>
            <p>
              {product.name} thuộc nhóm {categoryLabel.toLowerCase()}. Sản phẩm phù hợp cho người dùng cần một lựa chọn
              cân bằng giữa hiệu năng, giá bán và độ tin cậy.
            </p>
            <ul className="grid gap-2 pt-2 sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <BadgeCheck size={16} className="text-red-600" />
                <span>Thương hiệu: {product.brand || 'Đang cập nhật'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Star size={16} className="text-amber-500" />
                <span>Đánh giá: {product.source?.rating ?? '4.5'}/5</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-sky-600" />
                <span>Bảo hành và hỗ trợ đầy đủ</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck size={16} className="text-emerald-600" />
                <span>Giao hàng nhanh toàn quốc</span>
              </li>
            </ul>
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <SectionHeading title="Thông số kỹ thuật" />
          <div className="space-y-3">
            {Object.entries(product.specs ?? {}).map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-semibold text-slate-900 text-right">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <RelatedProductsSection title="Sản phẩm thường mua cùng" products={relatedProducts} />
      <ViewedProductsSection products={viewedProducts} />
    </div>
  )
}

export default function ProductDetailPage() {
  const { productId } = useParams()

  return <ProductDetailContent key={productId} productId={productId} />
}
