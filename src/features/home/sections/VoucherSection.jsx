import { coupons } from '../../../data/siteConfig'
import { PromoCard } from '../../../shared/ui/PromoCard'

export function VoucherSection() {
  return (
    <section className="section section--tight voucher-section" aria-label="Voucher khuyến mãi">
      <div className="coupon-row">
        {coupons.map((coupon) => (
          <PromoCard key={coupon.code} coupon={coupon} />
        ))}
      </div>
    </section>
  )
}
