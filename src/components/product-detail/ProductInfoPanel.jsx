import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, CheckCircle2, CircleCheckBig, ShieldCheck } from 'lucide-react'
import { ROUTES } from '../../config/routes'
import Button from '../../shared/ui/Button'
import Card from '../../shared/ui/Card'

export function ProductInfoPanel({ product, categoryLabel, oldPrice, formatCurrency, onAddToCart }) {
  const isDiscounted = Number(product.source?.discountPercentage ?? 0) > 0
  const rating = Number(product.source?.rating ?? 0)

  const infoRows = useMemo(
    () => [
      { label: 'Thương hiệu', value: product.brand || 'Đang cập nhật' },
      { label: 'Danh mục', value: categoryLabel },
      { label: 'Tồn kho', value: product.source?.stock ?? 'Đang cập nhật' },
      { label: 'Đánh giá', value: rating > 0 ? `${rating}/5` : 'Đang cập nhật' },
    ],
    [categoryLabel, product.brand, product.source?.stock, rating],
  )

  return (
    <Card className="p-6 sm:p-8">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-sky-600">{product.brand || 'Techstore'}</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{product.name}</h1>
          <p className="text-sm text-slate-500">{product.description}</p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <span className="text-3xl font-extrabold text-red-600">{product.priceText ?? formatCurrency(product.price)}</span>
          {isDiscounted && oldPrice ? (
            <span className="text-sm text-slate-400 line-through">{formatCurrency(oldPrice)}</span>
          ) : null}
        </div>

        <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
          {infoRows.map((row) => (
            <div key={row.label} className="space-y-1">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{row.label}</p>
              <p className="font-semibold text-slate-900">{row.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-3xl border border-red-100 bg-red-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-red-700">
            <CircleCheckBig size={16} />
            Khuyến mãi dành cho bạn
          </p>
          <div className="space-y-2 text-sm text-slate-700">
            <p className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600" />
              Trả góp 0% và nhiều ưu đãi thanh toán
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-sky-600" />
              Hỗ trợ đổi trả và bảo hành chính hãng
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button className="w-full" onClick={onAddToCart}>
            Mua ngay
          </Button>
          <Link
            to={`${ROUTES.COMPARE}?ids=${product.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            <BarChart3 size={16} />
            So sánh
          </Link>
        </div>
      </div>
    </Card>
  )
}
