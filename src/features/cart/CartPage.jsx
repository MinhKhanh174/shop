import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../shared/ui/Button.jsx'
import Card from '../../shared/ui/Card.jsx'
import { SectionHeading } from '../../shared/ui/SectionHeading.jsx'
import { useCart } from '../../hooks/useCart.js'
import { ROUTES } from '../../config/routes'

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart()
  const hasItems = cartItems.length > 0

  const handleCheckout = () => {
    toast('Tính năng thanh toán sẽ sớm ra mắt', { icon: '🛒' })
  }

  return (
    <div className="space-y-8">
      <SectionHeading title="Giỏ hàng" description="Kiểm tra lại sản phẩm, số lượng và tổng tiền trước khi thanh toán" />

      {hasItems ? (
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <img src={item.image} alt={item.name} className="h-28 w-28 rounded-3xl object-cover" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.brand}</p>
                  <p className="mt-2 text-red-600">{item.priceText}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm font-semibold"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm font-semibold"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="self-start rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                  onClick={() => removeFromCart(item.id)}
                >
                  Xóa
                </button>
              </Card>
            ))}
          </div>

          <Card className="space-y-6 rounded-[32px] bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm text-slate-500">Tổng đơn hàng</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{totalPrice}</p>
            </div>
            <Button className="w-full" onClick={handleCheckout}>
              Thanh toán
            </Button>
            <Link
              to={ROUTES.PRODUCTS}
              className="block text-center text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Tiếp tục mua sắm
            </Link>
          </Card>
        </div>
      ) : (
        <Card className="rounded-[32px] bg-white p-10 text-center text-slate-600 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Giỏ hàng của bạn đang trống</p>
          <Link
            to={ROUTES.PRODUCTS}
            className="mt-5 inline-flex rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
          >
            Xem sản phẩm
          </Link>
        </Card>
      )}
    </div>
  )
}
