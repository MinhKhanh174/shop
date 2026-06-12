import { Truck, RotateCcw, WalletCards } from 'lucide-react'
import { coupons } from '../../data/siteConfig'
import Card from '../../shared/ui/Card'
import { PromoCard } from '../../shared/ui/PromoCard'

export function ProductPromoSidebar() {
  return (
    <aside className="space-y-4">
      <Card className="p-4 sm:p-5">
        <div className="space-y-3 text-sm text-slate-700">
          <p className="flex items-start gap-2">
            <Truck size={16} className="mt-0.5 text-red-600" />
            Giao hàng miễn phí trong nội thành với đơn hàng đủ điều kiện.
          </p>
          <p className="flex items-start gap-2">
            <WalletCards size={16} className="mt-0.5 text-red-600" />
            Hỗ trợ trả góp và thanh toán linh hoạt theo nhu cầu.
          </p>
          <p className="flex items-start gap-2">
            <RotateCcw size={16} className="mt-0.5 text-red-600" />
            Đổi trả nhanh theo chính sách hiện hành của cửa hàng.
          </p>
        </div>
      </Card>

      <div className="space-y-3">
        {coupons.map((coupon) => (
          <PromoCard key={coupon.code} coupon={coupon} />
        ))}
      </div>
    </aside>
  )
}
