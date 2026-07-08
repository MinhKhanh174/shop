import { useEffect, useMemo, useState } from 'react'
import { Eye, Search, SlidersHorizontal } from 'lucide-react'

import AdminBadge from '../components/ui/AdminBadge'
import AdminButton from '../components/ui/AdminButton'
import AdminTable from '../components/ui/AdminTable'
import { formatCurrency } from '../../utils/formatCurrency'
import { getOrders } from '../services/adminOrderService'
import { formatAdminOrderStatus, formatAdminPaymentStatus } from '../utils/adminDisplayMapper'

const cardBase = 'rounded-[28px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]'

function formatDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function paymentMethodLabel(value) {
  switch (value) {
    case 'cod':
      return 'COD'
    case 'bank_transfer':
      return 'Chuyển khoản'
    case 'momo':
      return 'MoMo'
    case 'card':
      return 'Thẻ'
    default:
      return 'Khác'
  }
}

function paymentStatusLabel(status) {
  return formatAdminPaymentStatus(status, 'Chưa thanh toán')
}

function paymentStatusTone(status) {
  switch (status) {
    case 'paid':
      return 'success'
    case 'unpaid':
      return 'warning'
    case 'refunded':
      return 'danger'
    default:
      return 'neutral'
  }
}

function orderStatusLabel(status) {
  return formatAdminOrderStatus(status, 'Chờ xử lý')
}

function orderStatusTone(status) {
  switch (status) {
    case 'completed':
      return 'success'
    case 'shipping':
      return 'info'
    case 'confirmed':
      return 'indigo'
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'danger'
    default:
      return 'neutral'
  }
}

function EmptyState() {
  return (
    <div className={`${cardBase} px-6 py-16 text-center`}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Search size={22} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950">Không tìm thấy đơn hàng</h3>
      <p className="mt-2 text-sm text-slate-500">Hãy thử thay đổi từ khóa hoặc bộ lọc để xem các đơn phù hợp hơn.</p>
    </div>
  )
}
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [orderStatus, setOrderStatus] = useState('all')
  const [paymentMethod, setPaymentMethod] = useState('all')

  useEffect(() => {
    let active = true

    void getOrders().then((data) => {
      if (active) {
        setOrders(data)
      }
    })

    return () => {
      active = false
    }
  }, [])

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        [order.orderNumber, order.customerName, order.customerPhone].some((value) =>
          String(value ?? '').toLowerCase().includes(normalizedSearch),
        )

      const matchesOrderStatus = orderStatus === 'all' || order.orderStatus === orderStatus
      const matchesPaymentMethod = paymentMethod === 'all' || order.paymentMethod === paymentMethod

      return matchesSearch && matchesOrderStatus && matchesPaymentMethod
    })
  }, [orderStatus, orders, paymentMethod, search])

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Quản lý cửa hàng</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Quản lý đơn hàng</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Theo dõi mã đơn, thanh toán và tiến độ xử lý đơn trong một giao diện quản trị sáng, gọn và dễ đọc.
          </p>
        </div>

        <AdminButton variant="secondary">
          <SlidersHorizontal size={16} />
          Cáº­p nháº­t
        </AdminButton>
      </div>

      <div className={`${cardBase} space-y-4 p-5`}>
        <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr_1fr_auto]">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm đơn hàng, khách hàng hoặc số điện thoại..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <span className="text-sm font-medium text-slate-500">Trạng thái đơn</span>
            <select
              value={orderStatus}
              onChange={(event) => setOrderStatus(event.target.value)}
              className="ml-auto w-full bg-transparent text-sm text-slate-700 outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="shipping">Đang giao</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <span className="text-sm font-medium text-slate-500">Thanh toán</span>
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="ml-auto w-full bg-transparent text-sm text-slate-700 outline-none"
            >
              <option value="all">Tất cả phương thức</option>
              <option value="cod">COD</option>
              <option value="bank_transfer">Chuyá»ƒn khoáº£n</option>
              <option value="momo">MoMo</option>
              <option value="card">Tháº»</option>
            </select>
          </label>

          <AdminButton variant="secondary" className="justify-center">
            <SlidersHorizontal size={16} />
            Bá»™ lá»c
          </AdminButton>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">
            Hiển thị <span className="font-semibold text-slate-950">{filteredOrders.length.toLocaleString('vi-VN')}</span> /{' '}
            <span className="font-semibold text-slate-950">{orders.length.toLocaleString('vi-VN')}</span> đơn hàng
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <AdminBadge tone="success">{orders.filter((order) => order.paymentStatus === 'paid').length} Ä‘Ă£ thanh toĂ¡n</AdminBadge>
            <AdminBadge tone="warning">{orders.filter((order) => order.orderStatus === 'shipping').length} Ä‘ang giao</AdminBadge>
          </div>
        </div>
      </div>

      {filteredOrders.length ? (
        <AdminTable>
          <thead className="bg-slate-50/90">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <th className="px-5 py-4">Mã đơn</th>
              <th className="px-5 py-4">Khách hàng</th>
              <th className="px-5 py-4">Số điện thoại</th>
              <th className="px-5 py-4">Số sản phẩm</th>
              <th className="px-5 py-4">Tổng tiền</th>
              <th className="px-5 py-4">Thanh toán</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4">Ngày tạo</th>
              <th className="px-5 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="text-sm text-slate-700 transition-colors hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-950">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-slate-500">Mã: {order.id}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-950">{order.customerName}</p>
                </td>
                <td className="px-5 py-4">{order.customerPhone}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    {order.itemsCount}
                  </span>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-950">{formatCurrency(order.total)}</td>
                <td className="px-5 py-4">
                  <div className="space-y-2">
                    <p className="font-medium text-slate-950">{paymentMethodLabel(order.paymentMethod)}</p>
                    <AdminBadge tone={paymentStatusTone(order.paymentStatus)}>{paymentStatusLabel(order.paymentStatus)}</AdminBadge>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <AdminBadge tone={orderStatusTone(order.orderStatus)}>{orderStatusLabel(order.orderStatus)}</AdminBadge>
                </td>
                <td className="px-5 py-4 text-slate-600">{formatDate(order.createdAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <AdminButton variant="secondary" size="sm">
                      <Eye size={14} />
                      Xem
                    </AdminButton>
                    <AdminButton size="sm">Cập nhật</AdminButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : (
        <EmptyState />
      )}
    </section>
  )
}
