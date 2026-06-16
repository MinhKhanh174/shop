import { useState } from 'react'
import vourcherImg from '../../assets/vourcher.png'
import { CopyCodeButton } from './CopyCodeButton'
import { CouponConditionModal } from './CouponConditionModal'

export function PromoCard({ coupon }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

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
          <CopyCodeButton value={coupon.code} className="promo-card__button" successMessage={`Đã sao chép mã ${coupon.code}`}>
            Sao chép
          </CopyCodeButton>
          <button type="button" className="promo-card__condition" onClick={() => setIsModalOpen(true)}>
            {coupon.condition}
          </button>
        </div>
      </div>

      <CouponConditionModal coupon={coupon} open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </article>
  )
}
