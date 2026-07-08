import { mockDashboard } from '../data/mockDashboard'
import { getOrders } from './adminOrderService'
import { getProducts } from './adminProductService'
import { getUsers } from './adminUserService'
import { fetchDummyJsonCarts, fetchDummyJsonProducts, fetchDummyJsonUsers } from './dummyJsonAdminApi'
import { formatAdminOrderStatus, formatAdminSourceLabel } from '../utils/adminDisplayMapper'

function normalizeText(value, fallback = '') {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function formatDayKey(date) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function formatDayLabel(date) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

function inferSource(items, mockPrefix) {
  if (!Array.isArray(items) || items.length === 0) {
    return 'failed'
  }

  const isMock = items.every((item) => String(item?.id ?? '').trim().toLowerCase().startsWith(mockPrefix))
  return isMock ? 'mock' : 'api'
}

async function inspectSource(source, request) {
  try {
    await request()
    return {
      source,
      status: 'api',
      message: '',
    }
  } catch (error) {
    return {
      source,
      status: 'failed',
      message: normalizeText(error instanceof Error ? error.message : '', `Không tải được dữ liệu ${source}.`),
    }
  }
}

function isSameMonth(dateValue, referenceDate = new Date()) {
  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return false
  }

  return date.getFullYear() === referenceDate.getFullYear() && date.getMonth() === referenceDate.getMonth()
}

function buildTopProducts(orders, products, referenceDate = new Date()) {
  const catalogById = new Map()

  ;[...products].forEach((product) => {
    const keys = [product.id, product.remoteId, product.localId].map((key) => normalizeText(key, '')).filter(Boolean)

    keys.forEach((key) => {
      if (!catalogById.has(key)) {
        catalogById.set(key, product)
      }
    })
  })

  const statsByProduct = new Map()
  const monthlyOrders = orders.filter((order) => isSameMonth(order.createdAt, referenceDate))

  monthlyOrders.forEach((order) => {
    const orderItems = Array.isArray(order?.raw?.products) ? order.raw.products : []

    orderItems.forEach((item) => {
      const productId = normalizeText(item?.productId ?? item?.id ?? '', '')
      const title = normalizeText(item?.title, '')
      const quantity = Math.max(0, normalizeNumber(item?.quantity, 0))
      const revenue = normalizeNumber(item?.discountedTotal ?? item?.total ?? item?.price * quantity, 0)
      const catalogProduct = productId ? catalogById.get(productId) ?? null : null
      const key = productId || title

      if (!key) {
        return
      }

      const existing =
        statsByProduct.get(key) ?? {
          id: normalizeText(catalogProduct?.id ?? productId ?? key, key),
          name: normalizeText(catalogProduct?.name ?? title, 'Sản phẩm chưa đặt tên'),
          sold: 0,
          orderCount: 0,
          revenue: 0,
          stock: normalizeNumber(catalogProduct?.stock, 0),
          sortScore: 0,
        }

      existing.sold += quantity
      existing.orderCount += 1
      existing.revenue += revenue
      existing.stock = normalizeNumber(catalogProduct?.stock ?? existing.stock, existing.stock)
      existing.name = normalizeText(catalogProduct?.name ?? existing.name ?? title, 'Sản phẩm chưa đặt tên')
      existing.id = normalizeText(catalogProduct?.id ?? existing.id ?? key, key)
      existing.sortScore = existing.sold * 1000 + existing.orderCount * 10 + existing.revenue / 1000000

      statsByProduct.set(key, existing)
    })
  })

  if (!statsByProduct.size) {
    return mockDashboard.topProducts.slice(0, 5).map((product) => ({
      id: product.id,
      name: normalizeText(product.name, 'Sản phẩm chưa đặt tên'),
      sold: normalizeNumber(product.sold, 0),
      orderCount: 0,
      revenue: normalizeNumber(product.revenue, 0),
      stock: normalizeNumber(product.stock, 0),
    }))
  }

  return Array.from(statsByProduct.values())
    .sort((left, right) => right.sortScore - left.sortScore || right.sold - left.sold || right.orderCount - left.orderCount || right.revenue - left.revenue)
    .slice(0, 5)
    .map((product) => ({
      id: product.id,
      name: product.name,
      sold: product.sold,
      orderCount: product.orderCount,
      revenue: product.revenue,
      stock: product.stock,
    }))
}

function buildLowStockProducts(products) {
  return [...products]
    .filter((product) => normalizeNumber(product.stock, 0) < 10)
    .sort((left, right) => normalizeNumber(left.stock, 0) - normalizeNumber(right.stock, 0))
    .map((product) => ({
      id: product.id,
      name: normalizeText(product.name, 'Sản phẩm chưa đặt tên'),
      image: normalizeText(product.image ?? product.thumbnail, ''),
      sku: normalizeText(product.sku, ''),
      category: normalizeText(product.category, ''),
      categoryLabel: normalizeText(product.categoryLabel, product.category ?? ''),
      brand: normalizeText(product.brand, ''),
      price: normalizeNumber(product.price, 0),
      stock: normalizeNumber(product.stock, 0),
      status: normalizeText(product.status, ''),
      createdAt: normalizeText(product.createdAt, ''),
    }))
}

function buildRecentOrders(orders) {
  return [...orders]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5)
    .map((order) => ({
      id: order.id,
      customerName: normalizeText(order.customerName, 'Khách hàng'),
      total: normalizeNumber(order.total, 0),
      status: normalizeText(order.orderStatus, 'pending'),
      createdAt: order.createdAt,
    }))
}

function buildRevenueSeries(orders) {
  if (!orders.length) {
    return (mockDashboard.revenueSeries ?? []).map((item) => ({
      ...item,
      orderCount: normalizeNumber(item.orderCount, 0),
    }))
  }

  const sortedOrders = [...orders].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
  const latestOrderDate = new Date(sortedOrders[sortedOrders.length - 1]?.createdAt ?? Date.now())
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(latestOrderDate)
    date.setDate(date.getDate() - (6 - index))
    return date
  })

  const totalsByDay = new Map()
  const countsByDay = new Map()

  orders.forEach((order) => {
    const dayKey = formatDayKey(new Date(order.createdAt))
    totalsByDay.set(dayKey, (totalsByDay.get(dayKey) ?? 0) + normalizeNumber(order.total, 0))
    countsByDay.set(dayKey, (countsByDay.get(dayKey) ?? 0) + 1)
  })

  return days.map((date) => {
    const dayKey = formatDayKey(date)
    return {
      label: formatDayLabel(date),
      value: Math.round(totalsByDay.get(dayKey) ?? 0),
      orderCount: countsByDay.get(dayKey) ?? 0,
    }
  })
}

function buildMonthlyRevenue(orders, referenceDate = new Date()) {
  if (!orders.length) {
    return 0
  }

  const targetYear = referenceDate.getFullYear()
  const targetMonth = referenceDate.getMonth()

  return orders.reduce((sum, order) => {
    const createdAt = new Date(order.createdAt)

    if (Number.isNaN(createdAt.getTime())) {
      return sum
    }

    if (createdAt.getFullYear() !== targetYear || createdAt.getMonth() !== targetMonth) {
      return sum
    }

    return sum + normalizeNumber(order.total, 0)
  }, 0)
}

function buildRevenueChart(orders, sources) {
  return {
    key: 'revenue',
    title: 'Doanh thu 7 ngày gần nhất',
    sourceType: 'api',
    sourceLabel: 'Dữ liệu đơn hàng thực tế',
    note: 'Biểu đồ được tính trực tiếp từ tổng tiền đơn hàng đã đồng bộ vào admin.',
    data: buildRevenueSeries(orders),
    details: [
      `${formatAdminSourceLabel('orders')}: ${sources.orders === 'api' ? 'DummyJSON carts' : sources.orders === 'mock' ? formatAdminSourceLabel('mock') : formatAdminSourceLabel('failed')}`,
    ],
  }
}

function buildOrderSeries(orders) {
  const statusMap = new Map([
    ['pending', { label: formatAdminOrderStatus('pending'), tone: 'warning', color: '#3B82F6' }],
    ['confirmed', { label: formatAdminOrderStatus('confirmed'), tone: 'indigo', color: '#FBBF24' }],
    ['shipping', { label: formatAdminOrderStatus('shipping'), tone: 'info', color: '#8B5CF6' }],
    ['completed', { label: formatAdminOrderStatus('completed'), tone: 'success', color: '#22C55E' }],
    ['cancelled', { label: formatAdminOrderStatus('cancelled'), tone: 'danger', color: '#EF4444' }],
  ])

  const totalOrders = orders.length
  const counts = orders.reduce((accumulator, order) => {
    const status = normalizeText(order.orderStatus, 'pending')
    accumulator.set(status, (accumulator.get(status) ?? 0) + 1)
    return accumulator
  }, new Map())

  return Array.from(statusMap.entries()).map(([status, config]) => {
    const count = counts.get(status) ?? 0
    const percent = totalOrders > 0 ? (count / totalOrders) * 100 : 0

    return {
      status,
      label: config.label,
      tone: config.tone,
      count,
      percent: Number(percent.toFixed(1)),
      color: config.color,
    }
  })
}

function buildOrderChart(sources, orders) {
  return {
    key: 'orders',
    title: 'Phân bổ trạng thái đơn hàng',
    sourceType: sources.orders === 'api' ? 'api' : sources.orders === 'mock' ? 'mock' : 'failed',
    sourceLabel:
      sources.orders === 'api'
        ? `${formatAdminSourceLabel('orders')}: DummyJSON carts/người dùng`
        : sources.orders === 'mock'
          ? formatAdminSourceLabel('mock')
          : formatAdminSourceLabel('failed'),
    note:
      sources.orders === 'api'
        ? 'Biểu đồ lấy từ dữ liệu đơn hàng thật đã đồng bộ, theo trạng thái xử lý hiện tại.'
        : sources.orders === 'mock'
          ? 'Biểu đồ đang hiển thị từ dữ liệu dự phòng.'
          : 'Chưa có dữ liệu đơn hàng để dựng biểu đồ.',
    data: buildOrderSeries(orders),
    details: [
      `${formatAdminSourceLabel('orders')}: ${formatAdminSourceLabel(sources.orders)}`,
      `${formatAdminSourceLabel('users')}: ${formatAdminSourceLabel(sources.users)}`,
    ],
  }
}

function buildWarnings(sources) {
  const warnings = []

  if (sources.products !== 'api') {
    warnings.push('Sản phẩm không tải được từ API, đang dùng dữ liệu minh họa.')
  }

  if (sources.users !== 'api') {
    warnings.push('Khách hàng không tải được từ API, đang dùng dữ liệu minh họa.')
  }

  if (sources.orders !== 'api') {
    warnings.push('Đơn hàng không tải được từ API, đang dùng dữ liệu minh họa.')
  }

  return warnings
}

function buildErrors(failures) {
  return failures
    .filter((item) => item.status === 'failed')
    .map((item) => ({
      source: item.source,
      message: item.message,
    }))
}

function cloneFallbackDashboard() {
  const fallbackSources = {
    products: 'mock',
    users: 'mock',
    orders: 'mock',
  }

  return {
    state: 'warning',
    stats: {
      totalProducts: mockDashboard.totalProducts ?? mockDashboard.topProducts.length,
      totalUsers: mockDashboard.totalUsers ?? mockDashboard.totalCustomers,
      totalOrders: mockDashboard.totalOrders,
      totalRevenue: mockDashboard.totalRevenue,
      monthlyRevenue: mockDashboard.totalRevenue,
      lowStockProductsCount: mockDashboard.lowStockProducts.length,
    },
    charts: {
      revenueTrend: {
        key: 'revenue',
        title: 'Doanh thu 7 ngày gần nhất',
        sourceType: 'api',
        sourceLabel: 'Dữ liệu đơn hàng thực tế',
        note: 'Biểu đồ được tính trực tiếp từ tổng tiền đơn hàng đã đồng bộ vào admin.',
        data: mockDashboard.revenueSeries ?? [
          { label: '01/06', value: 8 },
          { label: '05/06', value: 13 },
          { label: '10/06', value: 12 },
          { label: '15/06', value: 21 },
          { label: '20/06', value: 20 },
          { label: '25/06', value: 33 },
          { label: '30/06', value: 27 },
        ],
        details: ['Chưa có API doanh thu'],
      },
      orderOverview: {
        key: 'orders',
        title: 'Phân bổ trạng thái đơn hàng',
        sourceType: 'mock',
        sourceLabel: 'Dữ liệu dự phòng',
        note: 'Biểu đồ đang hiển thị từ dữ liệu dự phòng.',
        data: [
          { status: 'pending', label: 'Chờ xác nhận', tone: 'warning', count: 32, percent: 25.4, color: '#3B82F6' },
          { status: 'confirmed', label: 'Đã xác nhận', tone: 'indigo', count: 43, percent: 34.1, color: '#FBBF24' },
          { status: 'shipping', label: 'Đang giao', tone: 'info', count: 26, percent: 20.6, color: '#8B5CF6' },
          { status: 'completed', label: 'Hoàn thành', tone: 'success', count: 20, percent: 15.9, color: '#22C55E' },
          { status: 'cancelled', label: 'Đã hủy', tone: 'danger', count: 5, percent: 3.9, color: '#EF4444' },
        ],
        details: [`${formatAdminSourceLabel('orders')}: ${formatAdminSourceLabel('mock')}`, `${formatAdminSourceLabel('users')}: ${formatAdminSourceLabel('mock')}`],
      },
      revenueSeries: mockDashboard.revenueSeries ?? [
        { label: '01/06', value: 8 },
        { label: '05/06', value: 13 },
        { label: '10/06', value: 12 },
        { label: '15/06', value: 21 },
        { label: '20/06', value: 20 },
        { label: '25/06', value: 33 },
        { label: '30/06', value: 27 },
      ],
      orderSeries: [
        { status: 'pending', label: 'Chờ xác nhận', tone: 'warning', count: 32, percent: 25.4, color: '#3B82F6' },
        { status: 'confirmed', label: 'Đã xác nhận', tone: 'indigo', count: 43, percent: 34.1, color: '#FBBF24' },
        { status: 'shipping', label: 'Đang giao', tone: 'info', count: 26, percent: 20.6, color: '#8B5CF6' },
        { status: 'completed', label: 'Hoàn thành', tone: 'success', count: 20, percent: 15.9, color: '#22C55E' },
        { status: 'cancelled', label: 'Đã hủy', tone: 'danger', count: 5, percent: 3.9, color: '#EF4444' },
      ],
    },
    recentOrders: mockDashboard.recentOrders.map((order) => ({ ...order })),
    topProducts: mockDashboard.topProducts.map((product) => ({ ...product })),
    lowStockProducts: mockDashboard.lowStockProducts.map((product) => ({ ...product })),
    sources: fallbackSources,
    warnings: ['Bảng điều khiển đang hiển thị dữ liệu demo dự phòng.'],
    errors: [],
    refreshedAt: new Date().toISOString(),
  }
}

function buildDashboardContract({ products, users, orders, sources }) {
  const totalRevenue = orders.reduce((sum, order) => sum + normalizeNumber(order.total, 0), 0)
  const monthlyRevenue = buildMonthlyRevenue(orders)
  const topProducts = buildTopProducts(orders, products)
  const lowStockProducts = buildLowStockProducts(products)
  const recentOrders = buildRecentOrders(orders)
  const revenueSeries = buildRevenueSeries(orders)
  const orderSeries = buildOrderSeries(orders)
  const warnings = buildWarnings(sources)
  const totalCustomers = users.length
  const errors = buildErrors(sources.failures ?? [])
  const state = errors.length ? 'mixed' : sources.overall
  const usedFallback = Object.values(sources.items).some((source) => source.status !== 'api')

  return {
    state,
    source: sources.overall,
    usedFallback,
    stats: {
      totalProducts: products.length,
      totalUsers: users.length,
      totalCustomers,
      totalOrders: orders.length,
      totalRevenue,
      monthlyRevenue,
      lowStockProductsCount: lowStockProducts.length,
    },
    charts: {
      revenueTrend: buildRevenueChart(orders, sources),
      orderOverview: buildOrderChart(sources, orders),
      revenueSeries,
      orderSeries,
    },
    recentOrders,
    orders,
    topProducts,
    lowStockProducts,
    sources: sources.items,
    warnings,
    errors,
    refreshedAt: new Date().toISOString(),
  }
}

export async function getDashboardData() {
  try {
    const [productApiStatus, userApiStatus, orderApiStatus, products, users, orders] = await Promise.all([
      inspectSource('products', () => fetchDummyJsonProducts({ limit: 100 })),
      inspectSource('users', () => fetchDummyJsonUsers({ limit: 100 })),
      inspectSource('orders', () => fetchDummyJsonCarts({ limit: 100 })),
      getProducts(),
      getUsers(),
      getOrders(),
    ])

    const items = {
      products: inferSource(products, 'prd-'),
      users: inferSource(users, 'usr-'),
      orders: inferSource(orders, 'ord-'),
    }

    const failures = [productApiStatus, userApiStatus, orderApiStatus].filter((item) => item.status === 'failed')
    const overallSource =
      failures.length === 0 && items.products === 'api' && items.users === 'api' && items.orders === 'api'
        ? 'api'
        : failures.length === 3 && items.products === 'mock' && items.users === 'mock' && items.orders === 'mock'
          ? 'mock'
          : failures.length > 0 || [items.products, items.users, items.orders].some((item) => item !== 'api')
            ? 'mixed'
            : 'api'

    if (!products.length && !users.length && !orders.length) {
    return {
      ...cloneFallbackDashboard(),
      state: 'empty',
      source: overallSource,
      usedFallback: true,
      errors: buildErrors([productApiStatus, userApiStatus, orderApiStatus]),
      warnings: buildWarnings(items),
      sources: items,
      orders,
    }
    }

    return buildDashboardContract({
      products,
      users,
      orders,
      sources: {
        items,
        failures: [productApiStatus, userApiStatus, orderApiStatus],
        overall: overallSource,
      },
    })
  } catch (error) {
    console.warn('getDashboardData failed', error)
    throw error
  }
}

export async function getAdminDashboardData() {
  return getDashboardData()
}
