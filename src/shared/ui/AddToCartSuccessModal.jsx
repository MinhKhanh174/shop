import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../config/routes'

export function AddToCartSuccessModal({ open, item, cartTotalText, cartCountText, onClose }) {
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

  if (!open || !item) {
    return null
  }

  if (typeof document === 'undefined') {
    return null
  }

  const modal = (
    <div className="add-to-cart-success-modal" role="presentation" onClick={() => onClose?.()}>
      <section
        className="add-to-cart-success-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-cart-success-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="add-to-cart-success-modal__header">
          <div className="add-to-cart-success-modal__title-wrap">
            <CheckCircle2 size={22} strokeWidth={2.5} />
            <h3 id="add-to-cart-success-title">Thêm vào giỏ hàng thành công</h3>
          </div>

          <button type="button" className="add-to-cart-success-modal__close" aria-label="Đóng" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="add-to-cart-success-modal__body">
          <div className="add-to-cart-success-modal__item">
            <div className="add-to-cart-success-modal__thumb">
              {item.image ? <img src={item.image} alt={item.name} /> : <div className="add-to-cart-success-modal__thumb-fallback" />}
            </div>

            <div className="add-to-cart-success-modal__meta">
              <h4>{item.name}</h4>
              {item.variant ? <p>{item.variant}</p> : null}
            </div>
          </div>

          <div className="add-to-cart-success-modal__summary">
            <div className="add-to-cart-success-modal__summary-label">Giỏ hàng hiện có</div>
            <div className="add-to-cart-success-modal__summary-values">
              <strong>{cartTotalText}</strong>
              <span>{cartCountText}</span>
            </div>
          </div>
        </div>

        <div className="add-to-cart-success-modal__footer">
          <Link to={ROUTES.CART} className="add-to-cart-success-modal__secondary" onClick={onClose}>
            Thanh toán
          </Link>
          <Link to={ROUTES.CART} className="add-to-cart-success-modal__primary" onClick={onClose}>
            Xem giỏ hàng
          </Link>
        </div>
      </section>
    </div>
  )

  return createPortal(modal, document.body)
}
