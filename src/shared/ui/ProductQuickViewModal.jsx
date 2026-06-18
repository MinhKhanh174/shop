import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../utils/currency'
import { ROUTES } from '../../config/routes'
import { useCartStore } from '../../store/useCartStore'
import {
  buildProductCode,
  extractColorOptions,
  extractStorageOptions,
  resolveGalleryImages,
} from '../../features/product/productDetail.utils'
import { AddToCartButton } from './AddToCartButton'

function getPrimaryProductImage(product, galleryImages) {
  if (galleryImages.length > 0) {
    return galleryImages[0]
  }

  return product?.image ?? product?.source?.images?.[0] ?? null
}

export function ProductQuickViewModal({ open, product, onClose, onAddedToCart }) {
  const addToCart = useCartStore((state) => state.addToCart)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [selectedStorageIndex, setSelectedStorageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const galleryImages = useMemo(() => resolveGalleryImages(product), [product])
  const colorOptions = useMemo(() => extractColorOptions(product), [product])
  const storageOptions = useMemo(() => extractStorageOptions(product), [product])
  const productCode = useMemo(() => buildProductCode(product), [product])
  const primaryImage = useMemo(() => getPrimaryProductImage(product, galleryImages), [product, galleryImages])

  useEffect(() => {
    if (!open) return

    setActiveImageIndex(0)
    setSelectedColorIndex(0)
    setSelectedStorageIndex(0)
    setQuantity(1)
  }, [open, product?.id])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open || !product) {
    return null
  }

  const images = galleryImages.length > 0 ? galleryImages : primaryImage ? [primaryImage] : []
  const currentImage = images[activeImageIndex] ?? primaryImage
  const brandLabel = product.brand ?? product.source?.brand ?? ''
  const title = product.name ?? product.title ?? 'Sản phẩm'
  const price = typeof product.price === 'number' ? product.price : 0
  const oldPrice =
    typeof product.oldPrice === 'number'
      ? product.oldPrice
      : typeof product.source?.oldPrice === 'number'
        ? product.source.oldPrice
        : typeof product.compareAtPrice === 'number'
          ? product.compareAtPrice
          : null
  const promoCode = 'EGANY'

  const handleCopyPromoCode = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(promoCode)
      } else {
        const tempInput = document.createElement('input')
        tempInput.value = promoCode
        tempInput.setAttribute('readonly', 'true')
        tempInput.style.position = 'absolute'
        tempInput.style.left = '-9999px'
        document.body.appendChild(tempInput)
        tempInput.select()
        document.execCommand('copy')
        document.body.removeChild(tempInput)
      }

      toast.success(`Đã sao chép mã ${promoCode}`)
    } catch {
      toast.error('Không thể sao chép mã. Vui lòng thử lại.')
    }
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)

    const selectedColor = colorOptions[selectedColorIndex]?.label
    const selectedStorage = storageOptions[selectedStorageIndex]
    const variant = [selectedColor, selectedStorage].filter(Boolean).join(' / ')
    const cartItems = useCartStore.getState().cartItems
    const cartTotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0)
    const cartCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)

    onClose?.()
    onAddedToCart?.({
      id: product.id,
      name: product.name,
      image: primaryImage ?? product.image ?? null,
      variant: variant || product.label || '',
      cartTotalText: formatCurrency(cartTotal),
      cartCountText: `(${cartCount}) sản phẩm`,
    })
  }

  const canDecrease = quantity > 1
  const canIncrease = typeof product.stock === 'number' ? quantity < product.stock : true

  const modal = (
    <div className="product-quick-view-modal" role="presentation" onClick={() => onClose?.()}>
      <section
        className="product-quick-view-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-quick-view-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="product-quick-view-modal__close" aria-label="Đóng" onClick={onClose}>
          <X size={22} />
        </button>

        <div className="pd-panel pd-panel--gallery product-quick-view-modal__media">
          <div className="product-quick-view-modal__stage">
            {currentImage ? (
              <img className="product-quick-view-modal__image" src={currentImage} alt={title} />
            ) : (
              <div className="product-quick-view-modal__placeholder">Không có hình ảnh</div>
            )}
          </div>

          {images.length > 1 ? (
            <div className="product-quick-view-modal__thumbs" aria-label="Ảnh sản phẩm">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={`product-quick-view-modal__thumb${index === activeImageIndex ? ' is-active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={image} alt={`${title} ${index + 1}`} />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="pd-panel pd-panel--info product-quick-view-modal__content">
          <div className="product-quick-view-modal__head">
            <h3 id="product-quick-view-title">{title}</h3>
            {brandLabel || productCode ? (
              <p className="product-quick-view-modal__meta">
                {brandLabel ? (
                  <>
                    <span className="product-quick-view-modal__meta-label">Thương hiệu:</span>
                    <button type="button" className="product-quick-view-modal__meta-value">
                      {brandLabel}
                    </button>
                  </>
                ) : null}
                {brandLabel && productCode ? <span className="product-quick-view-modal__meta-separator">|</span> : null}
                {productCode ? (
                  <>
                    <span className="product-quick-view-modal__meta-label">Mã sản phẩm:</span>
                    <button type="button" className="product-quick-view-modal__meta-value">
                      {productCode}
                    </button>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>

          <div className="product-quick-view-modal__price">
            <strong>{formatCurrency(price)}</strong>
            {oldPrice ? <span className="product-quick-view-modal__old-price">{formatCurrency(oldPrice)}</span> : null}
          </div>

          <div className="product-quick-view-modal__installment">Trả góp 0%</div>

          <div className="product-quick-view-modal__gift-banner">
            {product.perk ?? product.label ?? 'Tặng gói bảo hành Gold trị giá 300K'}
          </div>

          {(colorOptions.length > 0 || storageOptions.length > 0) && (
            <div className="product-quick-view-modal__options">
              {colorOptions.length > 0 ? (
                <div className="product-quick-view-modal__row">
                  <span className="product-quick-view-modal__label">Màu sắc:</span>
                  <div className="product-quick-view-modal__swatches">
                    {colorOptions.map((color, index) => (
                      <button
                        key={color.key ?? color.label ?? index}
                        type="button"
                        className={`product-quick-view-modal__swatch${index === selectedColorIndex ? ' is-active' : ''}`}
                        onClick={() => setSelectedColorIndex(index)}
                        aria-label={color.label ?? `Màu ${index + 1}`}
                      >
                        <span
                          className="product-quick-view-modal__swatch-color"
                          style={{
                            background: color.swatch ?? '#fff',
                            borderColor: color.border ?? color.swatch ?? '#d1d5db',
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {storageOptions.length > 0 ? (
                <div className="product-quick-view-modal__row">
                  <span className="product-quick-view-modal__label">Dung lượng:</span>
                  <div className="product-quick-view-modal__storages">
                    {storageOptions.map((storage, index) => (
                      <button
                        key={storage}
                        type="button"
                        className={`product-quick-view-modal__storage${index === selectedStorageIndex ? ' is-active' : ''}`}
                        onClick={() => setSelectedStorageIndex(index)}
                      >
                        {storage}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <div className="product-quick-view-modal__promo">
            <div className="product-quick-view-modal__promo-title">
              <span aria-hidden="true">🎁</span>
              KHUYẾN MÃI - ƯU ĐÃI
            </div>
            <ul className="product-quick-view-modal__promo-list">
              <li>
                Nhập mã <strong>{promoCode}</strong> thêm 5% đơn hàng{' '}
                <button type="button" onClick={handleCopyPromoCode}>
                  Sao chép
                </button>
              </li>
              <li>Giảm giá 10% khi mua từ 5 sản phẩm</li>
              <li>Tặng phiếu mua hàng khi mua từ 500k</li>
            </ul>
          </div>

          <div className="product-quick-view-modal__qty-row">
            <span className="product-quick-view-modal__label">Số lượng:</span>
            <div className="product-quick-view-modal__qty" aria-label="Số lượng sản phẩm">
              <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={!canDecrease}>
                <Minus size={14} />
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={quantity}
                onChange={(event) => {
                  const nextValue = Number(event.target.value.replace(/[^\d]/g, ''))
                  if (!Number.isNaN(nextValue)) {
                    setQuantity(Math.max(1, nextValue))
                  }
                }}
                aria-label="Nhập số lượng"
              />
              <button
                type="button"
                onClick={() => setQuantity((current) => (canIncrease ? current + 1 : current))}
                disabled={!canIncrease}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="product-quick-view-modal__actions">
            <AddToCartButton className="product-quick-view-modal__primary" icon={ShoppingCart} onClick={handleAddToCart}>
              THÊM VÀO GIỎ
            </AddToCartButton>
            <Link
              to={ROUTES.GUIDE_INSTALLMENT}
              className="product-quick-view-modal__secondary"
              onClick={onClose}
            >
              <span>MUA TRẢ GÓP</span>
              <small>Duyệt hồ sơ trong 5 phút</small>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(modal, document.body)
}
