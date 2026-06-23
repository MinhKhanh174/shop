import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  ShoppingCart,
  BarChart3,
  Gift,
  BadgePercent,
} from 'lucide-react'
import { useHomeData } from '../hooks/useHomeData'
import { useCart } from '../hooks/useCart'
import { useAddToCartSuccessFlow } from '../hooks/useAddToCartSuccessFlow'
import { useCompareActions } from '../hooks/useCompareActions'
import { ROUTES } from '../config/routes'
import { formatCurrency } from '../utils/formatCurrency'
import { findProductBySlug, getProductDetailPath, getProductSlug } from '../utils/productRoutes'
import { mapProductsToCards } from '../utils/productMapper'
import { getViewedProducts, saveViewedProductId } from '../utils/viewedProducts'
import { getCategoryCollectionPath } from '../utils/categoryRoutes'
import { buildBlogArticlePath, getRelatedBlogArticleForProduct } from '../utils/blogArticles'
import { ProductRail } from '../shared/ui/ProductRail'
import { CopyCodeButton } from '../shared/ui/CopyCodeButton'
import { useProductDetail } from '../features/product/hooks/useProductDetail'
import { coupons } from '../data/siteConfig'
import {
  buildCategoryLabel,
  buildProductCode,
  buildRelatedProducts,
  resolveGalleryImages,
} from '../features/product/productDetail.utils'
import {
  CouponCard,
  ProductBreadcrumb,
  ProductDetailSkeleton,
  ProductSummaryStrip,
} from '../features/product/components/ProductDetailBlocks'
import './ProductDetailPage.css'

function ProductDetailContent({ productId }) {
  const navigate = useNavigate()
  const { product, loading } = useProductDetail(productId)
  const { products: remoteProducts = [], categoryItems = [] } = useHomeData()
  const { addToCart } = useCart()
  const { addToCompareAndNotify } = useCompareActions()
  const { handleAddToCart: submitAddToCart, successModal } = useAddToCartSuccessFlow()
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [selectedStorageIndex, setSelectedStorageIndex] = useState(0)
  const [isSpecsOpen, setIsSpecsOpen] = useState(false)
  const maxQuantity = Number.isFinite(Number(product?.source?.stock)) ? Math.max(1, Number(product.source.stock)) : null

  useEffect(() => {
    if (product) {
      saveViewedProductId(product.id)
    }
  }, [product])

  const galleryImages = useMemo(() => resolveGalleryImages(product), [product])
  const activeImage = galleryImages[activeImageIndex] || galleryImages[0]
  const catalogProducts = useMemo(() => mapProductsToCards(remoteProducts, { label: 'Trả góp 0%' }), [remoteProducts])
  const relatedProducts = useMemo(() => buildRelatedProducts(remoteProducts, product), [remoteProducts, product])
  const viewedProducts = useMemo(() => getViewedProducts(catalogProducts, 4), [catalogProducts])
  const samePriceProducts = useMemo(() => {
    if (!product) return []

    const currentPrice = Number(product.price ?? 0)
    const candidates = catalogProducts.filter((item) => String(item.id) !== String(product.id))

    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
      return candidates.slice(0, 5)
    }

    return candidates
      .map((item) => ({
        item,
        diff: Math.abs(Number(item.price ?? 0) - currentPrice) / currentPrice,
      }))
      .filter(({ diff }) => diff <= 0.25)
      .sort((left, right) => left.diff - right.diff)
      .map(({ item }) => item)
      .slice(0, 5)
  }, [catalogProducts, product])
  const relatedArticle = useMemo(() => getRelatedBlogArticleForProduct(product), [product])
  const hasMultipleImages = galleryImages.length > 1

  const showPreviousImage = () => {
    if (!galleryImages.length) return
    setActiveImageIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length)
  }

  const showNextImage = () => {
    if (!galleryImages.length) return
    setActiveImageIndex((current) => (current + 1) % galleryImages.length)
  }

  if (loading) {
    return <ProductDetailSkeleton />
  }

  if (!product) {
    return (
      <div className="pd-page">
        <div className="pd-page__container">
          <ProductBreadcrumb
            items={[
              { label: 'Trang chủ', to: ROUTES.HOME },
              { label: 'Sản phẩm', to: ROUTES.PRODUCTS },
              { label: 'Không tìm thấy' },
            ]}
          />

          <div className="pd-empty">
            <p className="pd-empty__title">Sản phẩm không tồn tại</p>
            <p className="pd-empty__text">Trang chi tiết này không còn dữ liệu hoặc sản phẩm đã bị xóa.</p>
            <Link to={ROUTES.PRODUCTS} className="pd-empty__button">
              Quay về danh sách
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const categoryLabel = buildCategoryLabel(String(product.source?.category ?? ''), categoryItems)
  const discountPercentage = Number(product.source?.discountPercentage ?? 0)
  const oldPrice = discountPercentage > 0 ? Math.round(Number(product.price) / (1 - discountPercentage / 100)) : null
  const productCode = buildProductCode(product)
  const isDellBrand = String(product.brand ?? '').trim().toLowerCase() === 'dell'
  const isDellProductCode = String(productCode).toUpperCase() === 'DELL.NEW.DELL.XPS.13.9300.LAPTOP'
  const colorOptions = galleryImages.slice(0, 2).length > 0 ? galleryImages.slice(0, 2) : [product.image, product.image].filter(Boolean)
  const storageOptions = ['128GB', '256GB', '512GB']
  const hasColorData = Boolean(
    Array.isArray(product?.source?.colors) ||
      Array.isArray(product?.source?.colorOptions) ||
      Array.isArray(product?.source?.variants),
  )
  const hasStorageData = Boolean(
    product?.source?.storage ||
      product?.source?.storages ||
      product?.source?.capacity ||
      product?.source?.capacities ||
      product?.source?.variant ||
      product?.source?.variants,
  )

  const handleBuyNow = () => {
    addToCart(product, quantity)
    navigate(ROUTES.CART)
  }

  const handleAddToCart = () => {
    submitAddToCart(product, { quantity })
  }

  const handleAddToCompare = () => {
    addToCompareAndNotify(product)
  }

  const promoLines = [
    { text: 'Nhập mã EGANY thêm 5% đơn hàng ', copyLabel: 'Sao chép', copyValue: 'EGANY' },
    'Giảm giá 10% khi mua từ 5 sản phẩm',
    'Tặng phiếu mua hàng khi mua từ 500K',
  ]

  const specsEntries = Object.entries(product.specs ?? {})

  return (
    <div className="pd-page">
      <div className="pd-page__container">
        <ProductBreadcrumb
          items={[
            { label: 'Trang chủ', to: ROUTES.HOME },
            { label: categoryLabel, to: getCategoryCollectionPath(String(product.source?.category ?? '')) },
            { label: product.name },
          ]}
        />

        <section className="pd-hero">
          <div className="pd-panel pd-panel--gallery">
            <div className="pd-gallery">
              <div className="pd-gallery__stage">
                {hasMultipleImages ? (
                  <button
                    type="button"
                    className="pd-gallery__nav pd-gallery__nav--prev"
                    onClick={showPreviousImage}
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft size={26} />
                  </button>
                ) : null}

                <div className="pd-gallery__main">
                  {activeImage ? (
                    <img src={activeImage} alt={product.name} />
                  ) : (
                    <div className="pd-gallery__placeholder">img</div>
                  )}
                </div>

                {hasMultipleImages ? (
                  <button
                    type="button"
                    className="pd-gallery__nav pd-gallery__nav--next"
                    onClick={showNextImage}
                    aria-label="Ảnh tiếp theo"
                  >
                    <ChevronRight size={26} />
                  </button>
                ) : null}
              </div>

              <div className="pd-gallery__thumbs">
                {galleryImages.slice(0, 4).map((image, index) => {
                  const isActive = index === activeImageIndex

                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`pd-gallery__thumb${isActive ? ' is-active' : ''}`}
                      onClick={() => {
                        setActiveImageIndex(index)
                        if (index < colorOptions.length) {
                          setSelectedColorIndex(index)
                        }
                      }}
                    >
                      <img src={image} alt="" />
                    </button>
                  )
                })}
              </div>

              <div className="pd-share">
                <span className="pd-share__label">Chia sẻ</span>
                <button type="button" className="pd-share__icon pd-share__icon--fb">f</button>
                <button type="button" className="pd-share__icon pd-share__icon--pin">p</button>
                <button type="button" className="pd-share__icon pd-share__icon--tw">t</button>
              </div>
            </div>
          </div>

          <div className="pd-panel pd-panel--info">
            <div className="pd-info">
              <div className="pd-info__head">
                <h1 className={isDellBrand ? 'pd-info__accent-blue' : ''}>{product.name}</h1>
                <div className="pd-info__meta">
                  <span>
                    <span className="pd-info__label">Thương hiệu:</span>{' '}
                    <span className={`pd-info__value${isDellBrand ? ' pd-info__value--accent-blue' : ''}`}>{product.brand || 'Techstore'}</span>
                  </span>
                  <span>
                    <span className="pd-info__label">Mã sản phẩm:</span>{' '}
                    <span className={`pd-info__value${isDellProductCode ? ' pd-info__value--accent-blue' : ''}`}>{productCode}</span>
                  </span>
                </div>
                <button type="button" className="pd-info__compare" onClick={handleAddToCompare}>
                  <BarChart3 size={15} />
                  <span>So sánh</span>
                </button>
              </div>

              <div className="pd-price-box">
                <div className="pd-info__price-row">
                  <strong className="pd-info__price">{product.priceText ?? formatCurrency(product.price)}</strong>
                  {oldPrice ? <span className="pd-info__old-price">{formatCurrency(oldPrice)}</span> : null}
                </div>
              </div>

              <div className="pd-info__installment">Trả góp 0%</div>

              <div className="pd-info__gift-banner">
                <span>Tặng gói bảo hành Gold trị giá 300K</span>
              </div>

              <div className="pd-info__promo-wrap">
                <div className="pd-info__promo">
                  <div className="pd-info__promo-title">
                    <Gift size={16} />
                    <span>KHUYẾN MÃI - ƯU ĐÃI</span>
                  </div>
                  <ul className="pd-info__promo-list">
                    {promoLines.map((line) => (
                      <li key={typeof line === 'string' ? line : line.text}>
                        {typeof line === 'string' ? (
                          line
                        ) : (
                          <>
                            <span>{line.text}</span>
                            <CopyCodeButton value={line.copyValue} className="pd-promo-copy">
                              {line.copyLabel}
                            </CopyCodeButton>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {hasColorData ? (
                <div className="pd-info__section">
                  <p className="pd-info__section-label">Màu sắc:</p>
                  <div className="pd-colors">
                    {colorOptions.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        className={`pd-color${selectedColorIndex === index ? ' is-active' : ''}`}
                        onClick={() => {
                          setSelectedColorIndex(index)
                          setActiveImageIndex(index)
                        }}
                      >
                        <img src={image} alt="" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {hasStorageData ? (
                <div className="pd-info__section">
                  <p className="pd-info__section-label">Dung lượng:</p>
                  <div className="pd-storage">
                    {storageOptions.map((storage, index) => (
                      <label key={storage} className={`pd-storage__option${selectedStorageIndex === index ? ' is-active' : ''}`}>
                        <input
                          id={`swatch-${index + 1}-${storage.toLowerCase()}`}
                          type="radio"
                          name="storage"
                          value={storage}
                          checked={selectedStorageIndex === index}
                          onChange={() => setSelectedStorageIndex(index)}
                        />
                        <span>{storage}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="pd-info__section pd-info__section--qty">
                <p className="pd-info__section-label">Số lượng:</p>
                <div className="pd-qty" aria-label="Số lượng sản phẩm">
                  <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>
                    <Minus size={14} />
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) => {
                        if (maxQuantity === null) return current + 1
                        return Math.min(maxQuantity, current + 1)
                      })
                    }
                    disabled={maxQuantity !== null && quantity >= maxQuantity}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="pd-info__cta-stack">
                <button type="button" className="pd-btn pd-btn--primary" onClick={handleBuyNow}>
                  <span className="pd-btn__title">
                    <ShoppingCart size={16} />
                    <span>MUA NGAY</span>
                  </span>
                  <small>Giao tận nơi hoặc nhận tại cửa hàng</small>
                </button>

                <div className="pd-info__cta-row">
                  <button type="button" className="pd-btn pd-btn--secondary pd-btn--add-cart" onClick={handleAddToCart}>
                    <span>THÊM VÀO GIỎ</span>
                  </button>
                  <Link to={ROUTES.GUIDE_INSTALLMENT} className="pd-btn pd-btn--secondary pd-btn--installment">
                    <span>MUA TRẢ GÓP</span>
                    <small>Duyệt hồ sơ trong 5 phút</small>
                  </Link>
                </div>

                <p className="pd-info__hotline">Gọi đặt mua <strong>1800 0000</strong> (7:30 - 22:00)</p>
              </div>
            </div>
          </div>

          <aside className="pd-panel pd-panel--sidebar">
            <div className="pd-sidebar">
              {coupons.map((coupon) => (
                <CouponCard key={coupon.code} coupon={coupon} />
              ))}

              <div className="pd-benefits">
                <div className="pd-benefits__item">
                  <Truck size={16} />
                  <span>Giao hàng miễn phí trong 24h (chỉ áp dụng khu vực nội thành)</span>
                </div>
                <div className="pd-benefits__item">
                  <BadgePercent size={16} />
                  <span>Trả góp lãi suất 0% qua thẻ tín dụng Visa, Mastercard, JCB</span>
                </div>
                <div className="pd-benefits__item">
                  <RotateCcw size={16} />
                  <span>Đổi trả miễn phí trong 30 ngày</span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="pd-lower">
          <article className="pd-card pd-card--feature">
            <h2>ĐẶC ĐIỂM NỔI BẬT</h2>
            <div className="pd-card__body">
              <p>{relatedArticle?.summary ?? product.description}</p>

              {relatedArticle?.sections?.[0] ? (
                <>
                  <h3>{relatedArticle.sections[0].heading}</h3>
                  <p>{relatedArticle.sections[0].paragraphs?.[0] ?? product.description}</p>
                </>
              ) : null}

              {relatedArticle?.sections?.[1] ? (
                <>
                  <h3>{relatedArticle.sections[1].heading}</h3>
                  <p>{relatedArticle.sections[1].paragraphs?.[0] ?? product.description}</p>
                </>
              ) : null}
            </div>
            <Link className="pd-more" to={buildBlogArticlePath(relatedArticle)}>
              <span>+</span>
              <span>Xem thêm</span>
            </Link>
          </article>

          <article className="pd-card pd-card--spec">
            <h2>THÔNG SỐ KỸ THUẬT</h2>
            <div className="pd-specs">
              {specsEntries.map(([label, value]) => (
                <div key={label} className="pd-specs__row">
                  <span className="pd-specs__label">{label}</span>
                  <span className="pd-specs__value">{value}</span>
                </div>
              ))}
            </div>
            <button type="button" className="pd-more" onClick={() => setIsSpecsOpen(true)}>
              <span>+</span>
              <span>Xem thêm</span>
            </button>
          </article>
        </section>

        <ProductSummaryStrip
          product={product}
          image={activeImage}
          colorOptions={hasColorData ? colorOptions : []}
          storageOptions={hasStorageData ? storageOptions : []}
          selectedColorIndex={selectedColorIndex}
          selectedStorageIndex={selectedStorageIndex}
          quantity={quantity}
          maxQuantity={maxQuantity}
          oldPrice={oldPrice}
          discountPercentage={discountPercentage}
          onColorChange={(index) => {
            if (Number.isInteger(index) && index >= 0) {
              setSelectedColorIndex(index)
              setActiveImageIndex(index)
            }
          }}
          onStorageChange={(index) => {
            if (Number.isInteger(index) && index >= 0) {
              setSelectedStorageIndex(index)
            }
          }}
          onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
          onIncrease={() =>
            setQuantity((current) => {
              if (maxQuantity === null) return current + 1
              return Math.min(maxQuantity, current + 1)
            })
          }
          onAddToCart={handleAddToCart}
        />

        {relatedProducts.length > 0 ? (
          <ProductRail
            title="SẢN PHẨM THƯỜNG MUA CÙNG"
            products={relatedProducts}
            itemsPerPage={5}
            className="pd-related product-rail--detail"
          />
        ) : null}

        {samePriceProducts.length > 0 ? (
          <ProductRail
            title="SẢN PHẨM CÙNG PHÂN KHÚC GIÁ"
            products={samePriceProducts}
            itemsPerPage={5}
            className="pd-related product-rail--detail"
          />
        ) : null}

        {viewedProducts.length > 0 ? (
          <ProductRail
            title="SẢN PHẨM ĐÃ XEM"
            products={viewedProducts}
            itemsPerPage={5}
            className="pd-related product-rail--detail"
          />
        ) : null}
      </div>

      {isSpecsOpen ? (
        <div className="pd-specs-modal" role="presentation" onClick={() => setIsSpecsOpen(false)}>
          <div
            className="pd-specs-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pd-specs-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pd-specs-modal__header">
              <h3 id="pd-specs-modal-title">Thông số kỹ thuật</h3>
              <button type="button" className="pd-specs-modal__close" aria-label="Đóng" onClick={() => setIsSpecsOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="pd-specs-modal__body">
              <div className="pd-specs-modal__table">
                {specsEntries.map(([label, value]) => (
                  <div key={label} className="pd-specs-modal__row">
                    <div className="pd-specs-modal__label">{label}</div>
                    <div className="pd-specs-modal__value">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {successModal}
    </div>
  )
}

export default function ProductDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { productSlug } = useParams()
  const { products: remoteProducts = [], loading: homeLoading } = useHomeData()

  const resolvedProduct = useMemo(() => {
    if (productSlug) {
      return findProductBySlug(remoteProducts, productSlug)
    }

    return null
  }, [productSlug, remoteProducts])

  const resolvedProductId = resolvedProduct?.id ?? null
  const resolvedSlug = resolvedProduct ? getProductSlug(resolvedProduct) : ''

  useEffect(() => {
    if (!resolvedProduct || !productSlug) {
      return
    }

    if (!location.pathname.startsWith(`${ROUTES.PRODUCTS}/`) && resolvedSlug) {
      navigate(getProductDetailPath(resolvedProduct), { replace: true })
      return
    }

    if (resolvedSlug && resolvedSlug !== productSlug) {
      navigate(getProductDetailPath(resolvedProduct), { replace: true })
    }
  }, [location.pathname, navigate, productSlug, resolvedProduct, resolvedSlug])

  if (homeLoading && !resolvedProductId) {
    return <ProductDetailSkeleton />
  }

  if (!resolvedProductId) {
    return (
      <div className="pd-page">
        <div className="pd-page__container">
          <div className="pd-empty">
            <p className="pd-empty__title">Sản phẩm không tồn tại</p>
            <p className="pd-empty__text">Trang chi tiết này không còn dữ liệu hoặc sản phẩm đã bị xóa.</p>
            <Link to={ROUTES.PRODUCTS} className="pd-empty__button">
              Quay về danh sách
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <ProductDetailContent key={resolvedProductId} productId={resolvedProductId} />
}
