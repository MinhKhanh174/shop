import { useEffect } from 'react'
import { X } from 'lucide-react'
import { CopyCodeButton } from './CopyCodeButton'

function getConditionLines(coupon) {
  if (Array.isArray(coupon?.details) && coupon.details.length > 0) {
    return coupon.details
  }

  return [
    'Giá trị đơn hàng tối thiểu 500K.',
    'Mỗi khách hàng được sử dụng tối đa 1 lần.',
  ]
}

export function CouponConditionModal({ coupon, open, onClose }) {
  const conditionLines = getConditionLines(coupon)

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

  if (!open || !coupon) {
    return null
  }

  return (
    <div className="coupon-modal" role="presentation" onClick={onClose}>
      <div
        className="coupon-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="coupon-modal__close" aria-label="Đóng" onClick={onClose}>
          <X size={22} />
        </button>

        <h3 id="coupon-modal-title" className="coupon-modal__title">
          {coupon.title}
        </h3>

        <div className="coupon-modal__row">
          <span className="coupon-modal__label">Mã khuyến mãi:</span>
          <span className="coupon-modal__code">{coupon.code}</span>
        </div>

        <div className="coupon-modal__conditions">
          <span className="coupon-modal__section-title">Điều kiện:</span>
          <ul>
            {conditionLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="coupon-modal__footer">
          <button type="button" className="coupon-modal__secondary" onClick={onClose}>
            Đóng
          </button>
          <CopyCodeButton
            value={coupon.code}
            className="coupon-modal__primary"
            successMessage={`Đã sao chép mã ${coupon.code}`}
            showIcon={false}
          >
            Sao chép
          </CopyCodeButton>
        </div>
      </div>
    </div>
  )
}
