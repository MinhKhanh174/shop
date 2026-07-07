import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  Boxes,
  CalendarRange,
  ChevronRight,
  CircleDollarSign,
  RefreshCcw,
  ShoppingCart,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import AdminBadge from '../components/ui/AdminBadge'
import AdminButton from '../components/ui/AdminButton'
import { getDashboardData } from '../services/adminDashboardService'
import { formatCurrency } from '../../utils/formatCurrency'

const cardBase = 'rounded-[28px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]'
const DEFAULT_ERROR_MESSAGE = 'Không thể tải dữ liệu dashboard. Vui lòng thử lại.'

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

function latestOrderLabel(status) {
  switch (status) {
    case 'paid':
      return 'Đã thanh toán'
    case 'pending':
      return 'Chờ xác nhận'
    case 'confirmed':
      return 'Đã xác nhận'
    case 'shipping':
      return 'Đang giao'
    case 'completed':
      return 'Hoàn thành'
    case 'cancelled':
      return 'Đã hủy'
    default:
      return 'Khác'
  }
}

function latestOrderTone(status) {
  switch (status) {
    case 'paid':
      return 'success'
    case 'pending':
      return 'warning'
    case 'confirmed':
      return 'indigo'
    case 'shipping':
      return 'info'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'danger'
    default:
      return 'neutral'
  }
}

function ChartMeta({ sourceLabel, note, details = [] }) {
  return (
    <div className="border-t border-slate-100 px-5 py-4">
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          {sourceLabel}
        </span>
      </div>
      {note ? <p className="mt-2 text-sm leading-6 text-slate-500">{note}</p> : null}
      {details.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {details.map((detail) => (
            <span key={detail} className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
              {detail}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
function RevenueTrendChart({ chart }) {
  const series = chart.data ?? []
  const values = series.length ? series.map((item) => Number(item.value ?? 0)) : [0]
  const maxValue = Math.max(5, ...values)
  const width = 720
  const height = 260
  const padding = { top: 24, right: 16, bottom: 34, left: 44 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom
  const step = series.length > 1 ? innerWidth / (series.length - 1) : innerWidth
  const tickMax = Math.ceil(maxValue / 5) * 5

  const points = values.map((value, index) => {
    const x = padding.left + index * step
    const y = padding.top + (1 - value / maxValue) * innerHeight
    return { x, y }
  })

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const areaPath = `${linePath} L ${padding.left + innerWidth} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{chart.title}</h3>
          <p className="mt-1 text-sm text-slate-500">Biểu đồ minh họa, chưa có API doanh thu thật.</p>
        </div>
        <AdminButton variant="secondary" size="sm">
          7 ngày qua
          <ChevronRight size={14} />
        </AdminButton>
      </div>

      <div className="px-3 py-3 sm:px-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[280px] w-full">
          <defs>
            <linearGradient id="revenueFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3, 4, 5].map((index) => {
            const tick = (tickMax / 5) * index
            const y = padding.top + (1 - tick / tickMax) * innerHeight
            return (
              <g key={tick}>
                <line x1={padding.left} x2={padding.left + innerWidth} y1={y} y2={y} stroke="#E2E8F0" strokeDasharray="4 4" />
                <text x={12} y={y + 4} fill="#64748B" fontSize="11" fontWeight="600">
                  {tick === 0 ? '0' : `${Math.round(tick)}M`}
                </text>
              </g>
            )
          })}

          <path d={areaPath} fill="url(#revenueFill)" />
          <path d={linePath} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((point, index) => (
            <g key={index}>
              <circle cx={point.x} cy={point.y} r="5" fill="#fff" stroke="#3B82F6" strokeWidth="2.5" />
            </g>
          ))}

          {series.map((item, index) => {
            const x = padding.left + (series.length > 1 ? (innerWidth / (series.length - 1)) * index : innerWidth / 2)
            return (
              <text key={item.label} x={x} y={height - 10} textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="600">
                {item.label}
              </text>
            )
          })}
        </svg>
      </div>

      <ChartMeta sourceLabel={chart.sourceLabel} note={chart.note} details={chart.details} />
    </div>
  )
}
function OrderOverviewChart({ chart, totalOrders }) {
  const segments = chart.data ?? []
  const gradient = `conic-gradient(${segments
    .map((segment, index) => {
      const previous = segments.slice(0, index).reduce((sum, item) => sum + item.percent, 0)
      return `${segment.color} ${previous}% ${previous + segment.percent}%`
    })
    .join(', ')})`

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-900">{chart.title}</h3>
        <p className="mt-1 text-sm text-slate-500">Biểu đồ demo API từ DummyJSON carts/users, không phải production.</p>
      </div>

      <div className="mt-5 flex flex-col gap-5 px-5">
        <div className="flex items-center justify-center">
          <div className="relative h-56 w-56">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: gradient,
                filter: 'drop-shadow(0 12px 20px rgba(59,130,246,0.10))',
              }}
            />
            <div className="absolute inset-5 rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(226,232,240,1)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-semibold tracking-tight text-slate-950">{totalOrders.toLocaleString('vi-VN')}</p>
                <p className="mt-1 text-sm text-slate-500">Tổng đơn</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {segments.map((segment) => (
            <div key={segment.status} className="flex items-center justify-between gap-3 rounded-2xl px-1 py-1">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                <span className="text-sm text-slate-600">{segment.label}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {segment.count.toLocaleString('vi-VN')} <span className="text-slate-500">({segment.percent.toFixed(1)}%)</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ChartMeta sourceLabel={chart.sourceLabel} note={chart.note} details={chart.details} />
    </div>
  )
}

function StatCard({ label, value, hint, icon: Icon, accent }) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-2xl font-semibold text-slate-500">{label}</p>
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${accent} shadow-sm`}>
            <Icon size={20} className="text-blue-600" />
          </div>
        </div>
        <div className="min-w-0">
          <span className="block w-full break-words text-3xl font-semibold leading-tight tracking-tight text-slate-950">{value}</span>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-sm text-slate-500">
        <ArrowUpRight size={14} className="text-emerald-500" />
        {hint}
      </p>
    </article>
  )
}

function getErrorMessage(error) {
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message.trim()
  }

  return DEFAULT_ERROR_MESSAGE
}

function isDashboardEmpty(result) {
  return (
    Number(result?.stats?.totalProducts ?? 0) === 0 &&
    Number(result?.stats?.totalUsers ?? 0) === 0 &&
    Number(result?.stats?.totalOrders ?? 0) === 0 &&
    Number(result?.stats?.totalRevenue ?? 0) === 0 &&
    (result?.recentOrders?.length ?? 0) === 0 &&
    (result?.topProducts?.length ?? 0) === 0 &&
    (result?.lowStockProducts?.length ?? 0) === 0
  )
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [retryTick, setRetryTick] = useState(0)

  useEffect(() => {
    let active = true

    void getDashboardData()
      .then((result) => {
        if (!active) {
          return
        }

        setDashboard(result)

        if (result.state === 'empty' || isDashboardEmpty(result)) {
          setStatus('empty')
          return
        }

        if (result.usedFallback || (result.warnings?.length ?? 0) > 0 || (result.errors?.length ?? 0) > 0) {
          setStatus('warning')
          return
        }

        setStatus('success')
      })
      .catch((error) => {
        if (!active) {
          return
        }

        setDashboard(null)
        setStatus('error')
        setErrorMessage(getErrorMessage(error))
      })

    return () => {
      active = false
    }
  }, [retryTick])

  const handleRetry = () => {
    setRetryTick((current) => current + 1)
  }

  if (status === 'loading' || !dashboard) {
    return (
      <section className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-[28px] border border-slate-200 bg-white" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="h-[420px] animate-pulse rounded-[28px] border border-slate-200 bg-white" />
          <div className="h-[420px] animate-pulse rounded-[28px] border border-slate-200 bg-white" />
        </div>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="space-y-6">
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-rose-950">
          <p className="font-semibold">Không thể tải dữ liệu dashboard. Vui lòng thử lại.</p>
          <p className="mt-1 text-sm leading-6">{errorMessage || DEFAULT_ERROR_MESSAGE}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <RefreshCcw size={14} />
            Thử lại
          </button>
        </div>
      </section>
    )
  }

  if (status === 'empty') {
    return (
      <section className="space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 text-slate-950">
          <p className="font-semibold">Chưa có dữ liệu dashboard để hiển thị.</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">Hệ thống chưa nhận được dữ liệu từ products, users hoặc orders.</p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCcw size={14} />
            Tải lại
          </button>
        </div>
      </section>
    )
  }

  const summaryCards = [
    {
      label: 'Tổng danh thu',
      value: formatCurrency(dashboard.stats.monthlyRevenue ?? dashboard.stats.totalRevenue),
      hint: 'Doanh thu trong tháng hiện tại từ dashboard service.',
      icon: CircleDollarSign,
      accent: 'bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100',
    },
    {
      label: 'Tổng đơn hàng',
      value: dashboard.stats.totalOrders.toLocaleString('vi-VN'),
      hint: 'Lấy từ nguồn orders đã chuẩn hóa.',
      icon: ShoppingCart,
      accent: 'bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100',
    },
    {
      label: 'Tổng khách hàng',
      value: dashboard.stats.totalUsers.toLocaleString('vi-VN'),
      hint: 'Lấy từ nguồn users đã chuẩn hóa.',
      icon: Users,
      accent: 'bg-violet-50 text-violet-600 ring-1 ring-inset ring-violet-100',
    },
    {
      label: 'Sản phẩm sắp hết',
      value: dashboard.stats.lowStockProductsCount.toLocaleString('vi-VN'),
      hint: 'Tính từ products đã chuẩn hóa.',
      icon: Boxes,
      accent: 'bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100',
    },
  ]

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-[36px] font-bold uppercase tracking-[0.24em] text-slate-950">Tổng quan</p>
          <h1 className="mt-2 text-[14px] font-normal tracking-tight text-slate-500">
            Xin chào Admin, đây là dashboard demo đã tách rõ nguồn dữ liệu.
          </h1>
        </div>

        <AdminButton variant="secondary" className="w-fit" onClick={handleRetry}>
          <CalendarRange size={16} />
          Làm mới
        </AdminButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <RevenueTrendChart chart={dashboard.charts.revenueTrend} />
        <OrderOverviewChart chart={dashboard.charts.orderOverview} totalOrders={dashboard.stats.totalOrders} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className={cardBase}>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Đơn hàng gần đây</h3>
              <p className="mt-1 text-sm text-slate-500">Danh sách được chuẩn hóa trong service dashboard.</p>
            </div>
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
              Xem tất cả
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="overflow-hidden px-2 py-3">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-3 py-3">Mã đơn</th>
                  <th className="px-3 py-3">Khách hàng</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3">Ngày tạo</th>
                  <th className="px-3 py-3 text-right">Tổng tiền</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-50 text-sm text-slate-700 transition-colors hover:bg-slate-50/70 last:border-0">
                    <td className="px-3 py-4">
                      <p className="font-semibold text-slate-950">{order.id}</p>
                      <p className="mt-1 text-xs text-slate-500">Mã đơn nội bộ</p>
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-medium text-slate-950">{order.customerName}</p>
                    </td>
                    <td className="px-3 py-4">
                      <AdminBadge tone={latestOrderTone(order.status)}>{latestOrderLabel(order.status)}</AdminBadge>
                    </td>
                    <td className="px-3 py-4 text-slate-600">{formatDate(order.createdAt)}</td>
                    <td className="px-3 py-4 text-right font-semibold text-slate-950">{formatCurrency(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={cardBase}>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Sản phẩm bán chạy</h3>
              <p className="mt-1 text-sm text-slate-500">Dữ liệu được chuẩn hóa từ products service.</p>
            </div>
            <Link to="/admin/products" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
              Xem tất cả
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="px-2 py-3">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-3 py-3">Sản phẩm</th>
                  <th className="px-3 py-3 text-right">Đã bán</th>
                  <th className="px-3 py-3 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.topProducts.map((product, index) => (
                  <tr key={product.id} className="border-b border-slate-50 text-sm transition-colors hover:bg-slate-50/70 last:border-0">
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-950">{product.name}</p>
                          <p className="mt-1 text-xs text-slate-500">Tồn kho: {product.stock}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-right font-semibold text-slate-950">{product.sold.toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-4 text-right font-semibold text-slate-950">{formatCurrency(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>

    </section>
  )
}
