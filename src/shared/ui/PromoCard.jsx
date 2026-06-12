import { useState } from 'react'
import { Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import vourcherImg from '../../assets/vourcher.png'

export function PromoCard({ coupon }) {
  const [showInfo, setShowInfo] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coupon.code)
    toast.success(`Đã sao chép mã ${coupon.code}`)
  }

  return (
    <article className="promo-card">
      <div className="promo-card__icon" aria-hidden="true">
        <img src={vourcherImg} alt="" />
      </div>

      <div className="promo-card__body">
        <div className="promo-card__head">
          <h3 className="promo-card__title">{coupon.title}</h3>
          <p className="promo-card__description">{coupon.description}</p>
        </div>

        <div className="promo-card__actions">
          <button type="button" className="promo-card__button" onClick={handleCopy}>
            <Copy size={14} />
            <span>Sao chép</span>
          </button>
          <button type="button" className="promo-card__condition" onClick={() => setShowInfo((current) => !current)}>
            {coupon.condition}
          </button>
        </div>

        {showInfo ? (
          <div className="promo-card__description" style={{ marginTop: 10 }}>
            - Đơn hàng giá trị tối thiểu 500k.
            <br />
            - Chỉ áp dụng 1 mã giảm giá trên một đơn hàng.
          </div>
        ) : null}
      </div>
    </article>
  )
}
