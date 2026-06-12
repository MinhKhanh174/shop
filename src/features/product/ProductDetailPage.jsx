import { useParams, Link } from 'react-router-dom'
import Button from '../../shared/ui/Button.jsx'
import { SectionHeading } from '../../shared/ui/SectionHeading.jsx'
import { useCart } from '../../hooks/useCart.js'
import { ROUTES } from '../../config/routes'
import { useProductDetail } from './hooks/useProductDetail.js'

function ProductDetailContent({ productId }) {
  const { product, loading } = useProductDetail(productId)
  const { addToCart } = useCart()

  if (loading) {
    return <div className="rounded-[32px] bg-white p-10 shadow-sm">Đang tải sản phẩm...</div>
  }

  if (!product) {
    return (
      <div className="rounded-[32px] bg-white p-10 shadow-sm">
        <p className="text-lg font-semibold text-slate-900">Sản phẩm không tồn tại</p>
        <Link
          to={ROUTES.PRODUCTS}
          className="mt-4 inline-flex rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Quay về danh sách
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <img src={product.image} alt={product.name} className="h-[420px] w-full rounded-[28px] object-cover" />
          <div className="mt-6 space-y-4">
            <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
            <p className="text-sm uppercase tracking-[0.24em] text-red-600">{product.brand}</p>
            <p className="text-lg text-slate-600">{product.description}</p>
          </div>
        </div>

        <div className="space-y-6 rounded-[32px] bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm text-slate-500">Mã sản phẩm:</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{product.priceText}</p>
          </div>
          <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="font-semibold text-slate-900">Ưu đãi</p>
            <p className="text-sm text-slate-600">{product.promotion}</p>
          </div>
          <Button onClick={() => addToCart(product)} className="w-full">
            Thêm vào giỏ
          </Button>
          <Link
            to={ROUTES.CART}
            className="inline-flex w-full justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Xem giỏ hàng
          </Link>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-sm">
        <SectionHeading title="Thông số kỹ thuật" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(product.specs ?? {}).map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function ProductDetailPage() {
  const { productId } = useParams()

  return <ProductDetailContent key={productId} productId={productId} />
}
