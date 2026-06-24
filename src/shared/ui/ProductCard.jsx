import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, Heart, Plus, Search } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import { useCompareActions } from '../../hooks/useCompareActions'
import { getProductDetailPath } from '../../utils/productRoutes'
import { hasAuthSession } from '../../utils/authStorage'
import { queuePendingWishlistProduct } from '../../services/wishlistService'
import { useWishlistStore } from '../../store/useWishlistStore'
import { AddToCartButton } from './AddToCartButton'
import { AddToCartSuccessModal } from './AddToCartSuccessModal'
import { ProductQuickViewModal } from './ProductQuickViewModal'
import { ROUTES } from '../../config/routes'
import { footerColumns } from '../../data/siteConfig'

const policyItems = footerColumns.find((column) => column.title === 'Chính sách')?.items ?? []
const policyFallback = policyItems.find((item) => /đổi trả/i.test(item)) ?? policyItems.find((item) => /bảo hành/i.test(item)) ?? ''

export function ProductCard({ product, compact = false, variant = 'default' }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [successPayload, setSuccessPayload] = useState(null)
  const { addToCompareAndNotify } = useCompareActions()
  const navigate = useNavigate()
  const location = useLocation()
  const isFavorite = useWishlistStore((state) => state.wishlistItems.some((item) => String(item.id) === String(product.id)))
  const toggleFavorite = useWishlistStore((state) => state.toggleFavorite)

  const detailPath = getProductDetailPath(product)
  const primaryImage = product.image ?? null
  const secondaryImage = product.secondaryImage ?? product.source?.images?.[1] ?? null
  const discountPercentage = Number(product.discountPercentage ?? product.source?.discountPercentage ?? 0)
  const perkText =
    discountPercentage > 0
      ? `Giảm giá ${Math.round(discountPercentage)}%`
      : product.perk ?? product.label ?? policyFallback
  const hasSecondaryImage = Boolean(primaryImage && secondaryImage)
  const currentImage = hasSecondaryImage && isHovered ? secondaryImage : primaryImage
  const imageStyle = hasSecondaryImage
    ? {
        transition: 'transform 180ms ease, filter 180ms ease',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
      }
    : undefined
  const isPromoVariant = variant === 'promo'
  const promoTone = product.promoTone ?? product.tone ?? 'blue'

  const handleCardClick = () => {
    navigate(detailPath)
  }

  const stopCardClick = (event) => {
    event.stopPropagation()
  }

  const handleFavoriteClick = (event) => {
    stopCardClick(event)

    if (!hasAuthSession()) {
      queuePendingWishlistProduct(product)
      navigate(ROUTES.LOGIN, {
        state: {
          from: `${location.pathname}${location.search}`,
        },
      })
      return
    }

    toggleFavorite(product)
  }

  return (
    <>
      <article
        className={[
          'product-card',
          compact ? 'product-card--compact' : '',
          isPromoVariant ? 'product-card--promo' : '',
          isPromoVariant ? `product-card--promo-${promoTone}` : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="link"
        tabIndex={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        onClick={handleCardClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleCardClick()
          }
        }}
      >
        {isPromoVariant ? (
          <>
            <div className="product-card__promo-copy">
              <h4>{product.promoTitle ?? product.name}</h4>
              <strong>{product.promoDiscount ?? product.badge ?? product.label ?? ''}</strong>
              <span>{product.promoCta ?? 'MUA NGAY'}</span>
            </div>

            {primaryImage ? (
              <img
                className="product-card__promo-image"
                src={currentImage}
                alt={product.name}
                loading="lazy"
                style={imageStyle}
              />
            ) : (
              <div className="product-card__promo-placeholder" />
            )}

            <div className="product-card__promo-glow" aria-hidden="true" />
          </>
        ) : (
          <>
            <div className="product-card__media">
              <div className={`product-card__art product-card__art--${product.type}`} style={{ background: '#fff' }}>
                <div className="product-card__hover-actions" aria-label={`Tác vụ nhanh cho ${product.name}`}>
                  <Link
                    to={detailPath}
                    onClick={stopCardClick}
                    className="product-card__hover-action"
                    aria-label={`Xem chi tiết ${product.name}`}
                  >
                    <Search size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={(event) => {
                      stopCardClick(event)
                      addToCompareAndNotify(product)
                    }}
                    className="product-card__hover-action"
                    aria-label={`So sánh ${product.name}`}
                  >
                    <BarChart3 size={16} />
                  </button>
                </div>

                {primaryImage ? (
                  <div className="product-card__image-wrap">
                    <img
                      className="product-card__image"
                      src={currentImage}
                      alt={product.name}
                      loading="lazy"
                      style={imageStyle}
                    />
                  </div>
                ) : (
                  <div className="product-card__device">
                    <div className="product-card__glow" />
                    <div className="product-card__screen" />
                    <div className="product-card__home-indicator" />
                  </div>
                )}
              </div>
            </div>

            <div className="product-card__body">
              <h3>
                <Link to={detailPath} onClick={stopCardClick} className="product-card__title-link">
                  {product.name}
                </Link>
              </h3>

              <div className="product-card__price-row">
                <span className="product-card__price">{formatCurrency(product.price)}</span>
                <div className="product-card__actions">
                  <button
                    type="button"
                    className={`product-card__wishlist${isFavorite ? ' is-active' : ''}`}
                    onClick={handleFavoriteClick}
                    aria-label={isFavorite ? `Bỏ yêu thích ${product.name}` : `Yêu thích ${product.name}`}
                    aria-pressed={isFavorite}
                  >
                    <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <AddToCartButton
                    className="product-card__cta"
                    icon={Plus}
                    ariaLabel="Xem nhanh sản phẩm"
                    onClick={(event) => {
                      event.stopPropagation()
                      setIsQuickViewOpen(true)
                    }}
                  >
                    <span className="sr-only">Xem nhanh sản phẩm</span>
                  </AddToCartButton>
                </div>
              </div>

              {perkText ? <p className="product-card__perk">{perkText}</p> : null}
            </div>
          </>
        )}
      </article>

      <ProductQuickViewModal
        open={isQuickViewOpen}
        product={product}
        onClose={() => setIsQuickViewOpen(false)}
        onAddedToCart={(payload) => {
          setSuccessPayload(payload)
        }}
      />

      <AddToCartSuccessModal
        open={Boolean(successPayload)}
        item={successPayload}
        cartTotalText={successPayload?.cartTotalText ?? ''}
        cartCountText={successPayload?.cartCountText ?? ''}
        onClose={() => setSuccessPayload(null)}
      />
    </>
  )
}
