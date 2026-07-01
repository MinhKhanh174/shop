import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, X } from 'lucide-react'
import paymentMethods from '../../assets/PTTT.png'
import voucherIcon from '../../assets/vourcher.png'
import { useHomeData } from '../../hooks/useHomeData'
import { useCart } from '../../hooks/useCart'
import { ROUTES } from '../../constants/routes'
import { coupons } from '../../data/siteConfig'
import { formatCurrency } from '../../utils/currency'
import { mapProductsToCards } from '../../utils/productMapper'
import { getProductDetailPath } from '../../utils/productRoutes'
import { useCartStore } from '../../store/useCartStore'
import { ProductRail } from '../../shared/ui/ProductRail'
import { CopyCodeButton } from '../../shared/ui/CopyCodeButton'
import { CouponConditionModal } from '../../shared/ui/CouponConditionModal'
import { buildRelatedProductsByReference } from '../product/productDetail.utils'
import './CartPage.css'

const TIME_OPTIONS = [
  { value: '08:00-12:00', label: '08h00 - 12h00' },
  { value: '14:00-18:00', label: '14h00 - 18h00' },
  { value: '19:00-21:00', label: '19h00 - 21h00' },
]

function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function getPickupDays(cartItems) {
  const totalQuantity = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
  const distinctItems = cartItems.length
  const needsMoreTime = cartItems.some((item) => {
    const stock = Number(item?.stock)
    const quantity = Number(item?.quantity) || 0

    return Number.isFinite(stock) && stock > 0 && quantity > stock
  })

  if (needsMoreTime || totalQuantity >= 6 || distinctItems >= 4) {
    return 3
  }

  if (totalQuantity >= 3 || distinctItems >= 2) {
    return 2
  }

  return 1
}

function startOfDay(date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function addMonths(date, months) {
  const next = new Date(date)
  next.setDate(1)
  next.setMonth(next.getMonth() + months)
  return next
}

function formatDateInput(date) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatMonthYear(date) {
  return new Intl.DateTimeFormat('vi-VN', {
    month: 'long',
    year: 'numeric',
  })
    .format(date)
    .replace(/^./, (char) => char.toUpperCase())
}

function isSameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function getMonthGrid(viewMonth) {
  const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
  const firstDayIndex = firstOfMonth.getDay()
  const gridStart = new Date(firstOfMonth)
  gridStart.setDate(firstOfMonth.getDate() - firstDayIndex)

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(gridStart)
    current.setDate(gridStart.getDate() + index)
    return current
  })
}

function CartBreadcrumb() {
  return (
    <nav className="cart-breadcrumb" aria-label="Breadcrumb">
      <Link to={ROUTES.HOME}>Trang chủ</Link>
      <ChevronRight size={14} aria-hidden="true" />
      <span>Giỏ hàng</span>
    </nav>
  )
}

function CartItemRow({ item, onDecrease, onIncrease, onQuantityChange, onRemove }) {
  const maxQuantity = Number.isFinite(Number(item.stock)) && Number(item.stock) > 0 ? Math.max(1, Number(item.stock)) : null
  const canDecrease = Number(item.quantity) > 1
  const canIncrease = maxQuantity === null || Number(item.quantity) < maxQuantity

  const commitQuantity = (nextValue) => {
    const parsed = Number(nextValue)

    if (!Number.isFinite(parsed)) {
      return
    }

    const nextQuantity = Math.max(1, maxQuantity === null ? parsed : Math.min(maxQuantity, parsed))
    onQuantityChange(nextQuantity)
  }

  return (
    <div className="cart-item">
      <button type="button" className="cart-item__remove" onClick={onRemove} aria-label={`Xóa ${item.name}`}>
        <X size={16} />
      </button>

      <img src={item.image} alt={item.name} className="cart-item__image" />

      <div className="cart-item__info">
        <Link to={getProductDetailPath(item)} className="cart-item__name">
          {item.name}
        </Link>
        <p className="cart-item__variant">{item.brand ? `${item.brand} / ` : ''}128GB</p>
      </div>

      <div className="cart-item__price">{formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0))}</div>

      <div className="cart-item__qty" aria-label={`Số lượng ${item.name}`}>
        <button type="button" onClick={onDecrease} disabled={!canDecrease}>
          -
        </button>
        <input
          type="number"
          min="1"
          max={maxQuantity ?? undefined}
          value={item.quantity}
          onChange={(event) => commitQuantity(event.target.value)}
          inputMode="numeric"
          aria-label={`Nhập số lượng ${item.name}`}
        />
        <button type="button" onClick={onIncrease} disabled={!canIncrease}>
          +
        </button>
      </div>
    </div>
  )
}

function CartSummary({ totalPrice, onCheckout, onOpenVoucherDrawer, pickupDays }) {
  const minimumDate = startOfDay(new Date())
  const defaultPickupDate = startOfDay(addDays(new Date(), pickupDays))
  const [selectedDate, setSelectedDate] = useState(() => defaultPickupDate)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')
  const [isTimeOpen, setIsTimeOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => new Date(defaultPickupDate.getFullYear(), defaultPickupDate.getMonth(), 1))
  const calendarRef = useRef(null)
  const timeRef = useRef(null)

  useEffect(() => {
    function handleDocumentClick(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false)
      }

      if (timeRef.current && !timeRef.current.contains(event.target)) {
        setIsTimeOpen(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentClick)
    return () => document.removeEventListener('mousedown', handleDocumentClick)
  }, [])

  const monthGrid = useMemo(() => getMonthGrid(viewMonth), [viewMonth])
  const prevMonthDisabled =
    viewMonth.getFullYear() <= minimumDate.getFullYear() && viewMonth.getMonth() <= minimumDate.getMonth()

  const handleSelectDate = (date) => {
    if (date < minimumDate) {
      return
    }

    setSelectedDate(date)
    setIsCalendarOpen(false)
  }

  const selectedTimeLabel = TIME_OPTIONS.find((option) => option.value === selectedTime)?.label ?? 'Chọn thời gian'

  return (
    <aside className="cart-summary">
      <div className="cart-summary__section" ref={calendarRef}>
        <h3>Hẹn giờ nhận hàng</h3>

        <div className="cart-summary__fields">
          <label className="cart-summary__date-picker">
            <span>Ngày nhận hàng</span>
            <button
              type="button"
              className={`cart-summary__date-input${isCalendarOpen ? ' is-open' : ''}`}
              onClick={() => {
                setIsCalendarOpen((current) => !current)
                setIsTimeOpen(false)
              }}
              aria-haspopup="dialog"
              aria-expanded={isCalendarOpen}
            >
              <span>{formatDateInput(selectedDate)}</span>
            </button>

            {isCalendarOpen ? (
              <div className="cart-summary__calendar" role="dialog" aria-label="Chọn ngày nhận hàng">
                <div className="cart-summary__calendar-header">
                  <button
                    type="button"
                    className="cart-summary__calendar-nav"
                    onClick={() => {
                      if (!prevMonthDisabled) {
                        setViewMonth((current) => addMonths(current, -1))
                      }
                    }}
                    disabled={prevMonthDisabled}
                    aria-label="Tháng trước"
                  >
                    ‹
                  </button>
                  <strong>{formatMonthYear(viewMonth)}</strong>
                  <button
                    type="button"
                    className="cart-summary__calendar-nav"
                    onClick={() => setViewMonth((current) => addMonths(current, 1))}
                    aria-label="Tháng sau"
                  >
                    ›
                  </button>
                </div>

                <div className="cart-summary__calendar-weekdays" aria-hidden="true">
                  <span>CN</span>
                  <span>T2</span>
                  <span>T3</span>
                  <span>T4</span>
                  <span>T5</span>
                  <span>T6</span>
                  <span>T7</span>
                </div>

                <div className="cart-summary__calendar-grid">
                  {monthGrid.map((date) => {
                    const isOtherMonth = date.getMonth() !== viewMonth.getMonth()
                    const isPast = date < minimumDate
                    const isDisabled = isOtherMonth || isPast
                    const isSelected = isSameDay(date, selectedDate)

                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        className={[
                          'cart-summary__calendar-day',
                          isDisabled ? 'is-disabled' : '',
                          isSelected ? 'is-selected' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        disabled={isDisabled}
                        onClick={() => handleSelectDate(date)}
                      >
                        {date.getDate()}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </label>

          <label className="cart-summary__time-picker" ref={timeRef}>
            <span>Thời gian nhận hàng</span>
            <button
              type="button"
              className={`cart-summary__time-input${isTimeOpen ? ' is-open' : ''}`}
              onClick={() => {
                setIsTimeOpen((current) => !current)
                setIsCalendarOpen(false)
              }}
              aria-haspopup="listbox"
              aria-expanded={isTimeOpen}
            >
              <span>{selectedTimeLabel}</span>
            </button>

            {isTimeOpen ? (
              <div className="cart-summary__time-menu" role="listbox" aria-label="Chọn thời gian nhận hàng">
                {TIME_OPTIONS.map((option) => {
                  const isSelected = option.value === selectedTime

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`cart-summary__time-option${isSelected ? ' is-selected' : ''}`}
                      onClick={() => {
                        setSelectedTime(option.value)
                        setIsTimeOpen(false)
                      }}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </label>
        </div>
      </div>

      <div className="cart-summary__total">
        <span>Tổng cộng</span>
        <strong>{totalPrice}</strong>
      </div>

      <button type="button" className="cart-summary__voucher" onClick={onOpenVoucherDrawer}>
        <span className="cart-summary__voucher-left">
          <img src={voucherIcon} alt="" aria-hidden="true" className="cart-summary__voucher-icon" />
          <span className="cart-summary__voucher-label">Mã giảm giá</span>
        </span>
        <span className="cart-summary__voucher-link">
          <span>Chọn mã giảm giá</span>
          <span className="cart-summary__voucher-arrow" aria-hidden="true">
            &gt;
          </span>
        </span>
      </button>

      <button type="button" className="cart-summary__checkout" onClick={onCheckout}>
        Thanh Toán
      </button>

      <div className="cart-summary__payment">
        <h4>Phương thức thanh toán</h4>
        <img src={paymentMethods} alt="Phương thức thanh toán" />
      </div>
    </aside>
  )
}

function VoucherDrawer({ open, coupons, onClose, onOpenCondition }) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="voucher-drawer" role="presentation" onClick={onClose}>
      <aside
        className="voucher-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="voucher-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="voucher-drawer__header">
          <button type="button" className="voucher-drawer__back" onClick={onClose} aria-label="Quay lại trang giỏ hàng">
            <span aria-hidden="true">←</span>
          </button>
          <h2 id="voucher-drawer-title">Mã giảm giá</h2>
          <span className="voucher-drawer__spacer" aria-hidden="true" />
        </div>

        <div className="voucher-drawer__body">
          {coupons.map((coupon) => (
            <article key={coupon.code} className="promo-card voucher-drawer__promo-card">
              <div className="promo-card__icon voucher-drawer__promo-icon" aria-hidden="true">
                <img src={voucherIcon} alt="" />
              </div>

              <div className="promo-card__body voucher-drawer__promo-body">
                <div className="promo-card__head">
                  <h3 className="promo-card__title">{coupon.title}</h3>
                  <p className="promo-card__description">{coupon.description}</p>
                </div>

                <div className="promo-card__actions voucher-drawer__promo-actions">
                  <CopyCodeButton
                    value={coupon.code}
                    className="promo-card__button voucher-drawer__promo-copy"
                    successMessage={`Đã sao chép mã ${coupon.code}`}
                    showIcon={false}
                  >
                    Sao chép
                  </CopyCodeButton>

                  <button type="button" className="promo-card__condition voucher-drawer__promo-condition" onClick={() => onOpenCondition(coupon)}>
                    {coupon.condition}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="voucher-drawer__footer">
          <button type="button" className="voucher-drawer__return" onClick={onClose}>
            Quay lại trang giỏ hàng
          </button>
        </div>
      </aside>
    </div>
  )
}

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart()
  const navigate = useNavigate()
  const { products: remoteProducts = [] } = useHomeData()
  const syncCartWithCatalog = useCartStore((state) => state.syncCartWithCatalog)
  const [note, setNote] = useState('')
  const [isVoucherDrawerOpen, setIsVoucherDrawerOpen] = useState(false)
  const [activeCoupon, setActiveCoupon] = useState(null)

  const hasItems = cartItems.length > 0
  const productById = useMemo(
    () => new Map(mapProductsToCards(remoteProducts).map((product) => [String(product.id), product])),
    [remoteProducts],
  )
  const cartItemsWithStock = useMemo(
    () =>
      cartItems.map((item) => {
        const catalogItem = productById.get(String(item.id))

        return {
          ...item,
          category: item.category ?? catalogItem?.category ?? null,
          stock: item.stock ?? catalogItem?.stock ?? null,
        }
      }),
    [cartItems, productById],
  )
  const pickupDays = useMemo(() => getPickupDays(cartItemsWithStock), [cartItemsWithStock])
  const relatedProducts = useMemo(
    () => buildRelatedProductsByReference(remoteProducts, cartItemsWithStock, 9),
    [cartItemsWithStock, remoteProducts],
  )

  useEffect(() => {
    if (Array.isArray(remoteProducts) && remoteProducts.length > 0) {
      syncCartWithCatalog(remoteProducts)
    }
  }, [remoteProducts, syncCartWithCatalog])

  useEffect(() => {
    cartItemsWithStock.forEach((item) => {
      const maxQuantity = Number.isFinite(Number(item.stock)) && Number(item.stock) > 0 ? Math.max(1, Number(item.stock)) : null

      if (maxQuantity !== null && Number(item.quantity) > maxQuantity) {
        updateQuantity(item.id, maxQuantity)
      }
    })
  }, [cartItemsWithStock, updateQuantity])

  useEffect(() => {
    if (!isVoucherDrawerOpen) return undefined

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    return () => {
      body.style.overflow = previousOverflow
    }
  }, [isVoucherDrawerOpen])

  const handleCheckout = () => {
    navigate(ROUTES.CHECKOUT)
  }

  return (
    <div className="cart-page">
      <CartBreadcrumb />

      <div className="cart-page__title">
        <h1>Giỏ hàng</h1>
      </div>

      {hasItems ? (
        <>
          <div className="cart-page__layout">
            <section className="cart-list">
              {cartItemsWithStock.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                  onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                  onQuantityChange={(quantity) => updateQuantity(item.id, quantity)}
                  onRemove={() => removeFromCart(item.id)}
                />
              ))}

              <label className="cart-note">
                <span>Ghi chú đơn hàng</span>
                <textarea value={note} onChange={(event) => setNote(event.target.value)} />
              </label>
            </section>

            <CartSummary
              key={pickupDays}
              totalPrice={totalPrice}
              onCheckout={handleCheckout}
              onOpenVoucherDrawer={() => setIsVoucherDrawerOpen(true)}
              pickupDays={pickupDays}
            />
          </div>

          <ProductRail
            title="Sản phẩm thường mua cùng"
            products={relatedProducts}
            itemsPerPage={5}
            className="product-rail--detail"
          />
        </>
      ) : (
        <div className="cart-empty">
          <p>Giỏ hàng của bạn đang trống</p>
          <Link to={ROUTES.PRODUCTS}>Xem sản phẩm</Link>
        </div>
      )}

      <VoucherDrawer
        open={isVoucherDrawerOpen}
        coupons={coupons}
        onClose={() => setIsVoucherDrawerOpen(false)}
        onOpenCondition={setActiveCoupon}
      />

      <CouponConditionModal coupon={activeCoupon} open={Boolean(activeCoupon)} onClose={() => setActiveCoupon(null)} />
    </div>
  )
}
