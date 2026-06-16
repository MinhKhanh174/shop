import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, X } from 'lucide-react'
import toast from 'react-hot-toast'
import paymentMethods from '../../assets/PTTT.png'
import { useHomeData } from '../../hooks/useHomeData'
import { useCart } from '../../hooks/useCart'
import { ROUTES } from '../../config/routes'
import { formatCurrency } from '../../utils/currency'
import { mapProductsToCards } from '../../utils/productMapper'
import { ProductRail } from '../../shared/ui/ProductRail'
import './CartPage.css'

function CartBreadcrumb() {
  return (
    <nav className="cart-breadcrumb" aria-label="Breadcrumb">
      <Link to={ROUTES.HOME}>Trang chủ</Link>
      <ChevronRight size={14} aria-hidden="true" />
      <span>Giỏ hàng</span>
    </nav>
  )
}

function CartItemRow({ item, onDecrease, onIncrease, onRemove }) {
  return (
    <div className="cart-item">
      <button type="button" className="cart-item__remove" onClick={onRemove} aria-label={`Xóa ${item.name}`}>
        <X size={16} />
      </button>

      <img src={item.image} alt={item.name} className="cart-item__image" />

      <div className="cart-item__info">
        <h3 className="cart-item__name">{item.name}</h3>
        <p className="cart-item__variant">{item.brand ? `${item.brand} / ` : ''}128GB</p>
      </div>

      <div className="cart-item__price">{formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0))}</div>

      <div className="cart-item__qty" aria-label={`Số lượng ${item.name}`}>
        <button type="button" onClick={onDecrease}>
          −
        </button>
        <span>{item.quantity}</span>
        <button type="button" onClick={onIncrease}>
          +
        </button>
      </div>
    </div>
  )
}

function CartSummary({ totalPrice, onCheckout }) {
  return (
    <aside className="cart-summary">
      <div className="cart-summary__section">
        <h3>HẸN GIỜ NHẬN HÀNG</h3>
        <div className="cart-summary__fields">
          <label>
            <span>Ngày nhận hàng</span>
            <input type="text" value="16/08/2026" readOnly />
          </label>
          <label>
            <span>Thời gian nhận hàng</span>
            <select defaultValue="">
              <option value="" disabled>
                Chọn thời gian
              </option>
              <option>8:00 - 12:00</option>
              <option>12:00 - 18:00</option>
              <option>18:00 - 21:00</option>
            </select>
          </label>
        </div>
      </div>

      <div className="cart-summary__total">
        <span>TỔNG CỘNG</span>
        <strong>{totalPrice}</strong>
      </div>

      <button type="button" className="cart-summary__voucher">
        <span>Mã giảm giá</span>
        <span className="cart-summary__voucher-link">Chọn mã giảm giá &gt;</span>
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

function buildRelatedProducts(cartItems, remoteProducts) {
  const cartBrands = new Set(cartItems.map((item) => String(item.brand ?? '').toLowerCase()).filter(Boolean))
  const cartIds = new Set(cartItems.map((item) => String(item.id)))

  const mapped = mapProductsToCards(remoteProducts, { label: 'Trả góp 0%' })

  return mapped
    .filter((product) => !cartIds.has(String(product.id)))
    .sort((left, right) => {
      const leftMatch = cartBrands.has(String(left.brand ?? '').toLowerCase()) ? 1 : 0
      const rightMatch = cartBrands.has(String(right.brand ?? '').toLowerCase()) ? 1 : 0
      return rightMatch - leftMatch
    })
    .slice(0, 9)
}

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart()
  const { products: remoteProducts = [] } = useHomeData()
  const [note, setNote] = useState('')

  const hasItems = cartItems.length > 0
  const relatedProducts = useMemo(() => buildRelatedProducts(cartItems, remoteProducts), [cartItems, remoteProducts])

  const handleCheckout = () => {
    toast('Tính năng thanh toán sẽ sớm ra mắt', { icon: '🛒' })
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
              {cartItems.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                  onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                  onRemove={() => removeFromCart(item.id)}
                />
              ))}

              <label className="cart-note">
                <span>Ghi chú đơn hàng</span>
                <textarea value={note} onChange={(event) => setNote(event.target.value)} />
              </label>
            </section>

            <CartSummary totalPrice={totalPrice} onCheckout={handleCheckout} />
          </div>

          <ProductRail title="Sản phẩm thường mua cùng" products={relatedProducts} className="cart-page__related" />
        </>
      ) : (
        <div className="cart-empty">
          <p>Giỏ hàng của bạn đang trống</p>
          <Link to={ROUTES.PRODUCTS}>Xem sản phẩm</Link>
        </div>
      )}
    </div>
  )
}
