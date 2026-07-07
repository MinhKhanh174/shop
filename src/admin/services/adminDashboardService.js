import { mockDashboard } from '../data/mockDashboard'
import { getOrders } from './adminOrderService'
import { getProducts } from './adminProductService'
import { getUsers } from './adminUserService'
import { fetchDummyJsonCarts, fetchDummyJsonProducts, fetchDummyJsonUsers } from './dummyJsonAdminApi'

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

function buildTopProducts(products) {
  return [...products]
    .map((product) => {
      const rating = normalizeNumber(product.rating, 0)
      const discountPercentage = normalizeNumber(product.discountPercentage, 0)
      const stock = normalizeNumber(product.stock, 0)
      const sold = Math.max(1, Math.round(rating * 8 + discountPercentage / 3 + Math.max(0, 20 - stock)))

      return {
        id: product.id,
        name: normalizeText(product.name, 'Sản phẩm chưa đặt tên'),
        sold,
        revenue: normalizeNumber(product.price, 0) * sold,
        stock,
        score: rating * 100 + discountPercentage * 2 - stock,
      }
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map((product) => ({
      id: product.id,
      name: product.name,
      sold: product.sold,
      revenue: product.revenue,
      stock: product.stock,
    }))
}

function buildLowStockProducts(products) {
  return [...products]
    .filter((product) => normalizeNumber(product.stock, 0) <= 5)
    .sort((left, right) => normalizeNumber(left.stock, 0) - normalizeNumber(right.stock, 0))
    .slice(0, 4)
    .map((product) => ({
      id: product.id,
      name: normalizeText(product.name, 'Sản phẩm chưa đặt tên'),
      stock: normalizeNumber(product.stock, 0),
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
    return mockDashboard.revenueSeries ?? []
  }

  const sortedOrders = [...orders].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
  const latestOrderDate = new Date(sortedOrders[sortedOrders.length - 1]?.createdAt ?? Date.now())
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(latestOrderDate)
    date.setDate(date.getDate() - (6 - index))
    return date
  })

  const totalsByDay = new Map()

  orders.forEach((order) => {
    const dayKey = formatDayKey(new Date(order.createdAt))
    totalsByDay.set(dayKey, (totalsByDay.get(dayKey) ?? 0) + normalizeNumber(order.total, 0) / 1000000)
  })

  return days.map((date) => {
    const dayKey = formatDayKey(date)
    return {
      label: formatDayLabel(date),
      value: Number((totalsByDay.get(dayKey) ?? 0).toFixed(1)),
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
    title: 'Doanh thu theo ngày',
    sourceType: 'illustration',
    sourceLabel: 'Dữ liệu minh họa',
    note: 'Chưa có API doanh thu thật. Biểu đồ này là ước tính/demo từ dữ liệu đơn hàng và fallback mock.',
    data: buildRevenueSeries(orders),
    details: [
      `Orders source: ${sources.orders === 'api' ? 'DummyJSON carts' : sources.orders === 'mock' ? 'Mock fallback' : 'Failed'}`,
    ],
  }
}

function buildOrderSeries(orders) {
  const statusMap = new Map([
    ['pending', { label: 'Chờ xác nhận', tone: 'warning', color: '#3B82F6' }],
    ['confirmed', { label: 'Đã xác nhận', tone: 'indigo', color: '#FBBF24' }],
    ['shipping', { label: 'Đang giao', tone: 'info', color: '#8B5CF6' }],
    ['completed', { label: 'Hoàn thành', tone: 'success', color: '#22C55E' }],
    ['cancelled', { label: 'Đã hủy', tone: 'danger', color: '#EF4444' }],
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
    title: 'Tổng quan đơn hàng',
    sourceType: sources.orders === 'api' ? 'api' : sources.orders === 'mock' ? 'mock' : 'failed',
    sourceLabel:
      sources.orders === 'api'
        ? 'Nguồn: DummyJSON carts/users'
        : sources.orders === 'mock'
          ? 'Mock fallback'
          : 'Failed',
    note:
      sources.orders === 'api'
        ? 'Biểu đồ được tính từ dữ liệu đơn hàng demo API, không phải API production.'
        : sources.orders === 'mock'
          ? 'Biểu đồ đang hiển thị từ dữ liệu demo fallback.'
          : 'Chưa có dữ liệu đơn hàng để dựng biểu đồ.',
    data: buildOrderSeries(orders),
    details: [
      `Orders source: ${sources.orders}`,
      `Users source: ${sources.users}`,
    ],
  }
}

function buildWarnings(sources) {
  const warnings = []

  if (sources.products !== 'api') {
    warnings.push('Products không tải được từ API, đang dùng dữ liệu minh họa.')
  }

  if (sources.users !== 'api') {
    warnings.push('Users không tải được từ API, đang dùng dữ liệu minh họa.')
  }

  if (sources.orders !== 'api') {
    warnings.push('Orders không tải được từ API, đang dùng dữ liệu minh họa.')
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
        title: 'Doanh thu theo ngày',
        sourceType: 'illustration',
        sourceLabel: 'Dữ liệu minh họa',
        note: 'Chưa có API doanh thu thật. Dữ liệu này là minh họa/demo fallback.',
        data: mockDashboard.revenueSeries ?? [
          { label: '01/06', value: 8 },
          { label: '05/06', value: 13 },
          { label: '10/06', value: 12 },
          { label: '15/06', value: 21 },
          { label: '20/06', value: 20 },
          { label: '25/06', value: 33 },
          { label: '30/06', value: 27 },
        ],
        details: ['Revenue API: none'],
      },
      orderOverview: {
        key: 'orders',
        title: 'Tổng quan đơn hàng',
        sourceType: 'mock',
        sourceLabel: 'Mock fallback',
        note: 'Biểu đồ đang dùng dữ liệu demo fallback.',
        data: [
          { status: 'pending', label: 'Chờ xác nhận', tone: 'warning', count: 32, percent: 25.4, color: '#3B82F6' },
          { status: 'confirmed', label: 'Đã xác nhận', tone: 'indigo', count: 43, percent: 34.1, color: '#FBBF24' },
          { status: 'shipping', label: 'Đang giao', tone: 'info', count: 26, percent: 20.6, color: '#8B5CF6' },
          { status: 'completed', label: 'Hoàn thành', tone: 'success', count: 20, percent: 15.9, color: '#22C55E' },
          { status: 'cancelled', label: 'Đã hủy', tone: 'danger', count: 5, percent: 3.9, color: '#EF4444' },
        ],
        details: ['Orders source: mock', 'Users source: mock'],
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
    warnings: ['Dashboard đang hiển thị dữ liệu demo fallback.'],
    errors: [],
    refreshedAt: new Date().toISOString(),
  }
}

function buildDashboardContract({ products, users, orders, sources }) {
  const totalRevenue = orders.reduce((sum, order) => sum + normalizeNumber(order.total, 0), 0)
  const monthlyRevenue = buildMonthlyRevenue(orders)
  const topProducts = buildTopProducts(products)
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
