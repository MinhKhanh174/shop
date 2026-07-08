const STATUS_LABELS = {
  active: 'Đang bán',
  inactive: 'Ngừng bán',
  enabled: 'Đang bật',
  disabled: 'Đang tắt',
  draft: 'Bản nháp',
  published: 'Đã đăng',
  archived: 'Đã lưu trữ',
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  failed: 'Thất bại',
  paid: 'Đã thanh toán',
  unpaid: 'Chưa thanh toán',
  refunded: 'Đã hoàn tiền',
}

const AVAILABILITY_STATUS_LABELS = {
  'in stock': 'Còn hàng',
  instock: 'Còn hàng',
  'low stock': 'Sắp hết hàng',
  'out of stock': 'Hết hàng',
  discontinued: 'Ngừng bán',
  preorder: 'Đặt trước',
  backorder: 'Chờ hàng',
  'limited stock': 'Số lượng có hạn',
  active: 'Đang bán',
  inactive: 'Ngừng bán',
}

const CATEGORY_LABELS = {
  smartphone: 'Điện thoại thông minh',
  smartphones: 'Điện thoại thông minh',
  phone: 'Điện thoại',
  phones: 'Điện thoại',
  mobile: 'Điện thoại',
  tablet: 'Máy tính bảng',
  tablets: 'Máy tính bảng',
  laptop: 'Máy tính xách tay',
  laptops: 'Máy tính xách tay',
  audio: 'Âm thanh',
  headphones: 'Tai nghe',
  accessory: 'Phụ kiện',
  accessories: 'Phụ kiện',
  beauty: 'Làm đẹp',
  fragrances: 'Nước hoa',
  fragrance: 'Nước hoa',
  furniture: 'Nội thất',
  groceries: 'Đồ tạp hóa',
  skincare: 'Chăm sóc da',
  'skin-care': 'Chăm sóc da',
  'home-decoration': 'Trang trí nhà cửa',
  tops: 'Áo thun',
  'women-dresses': 'Đầm nữ',
  'women-shoes': 'Giày nữ',
  "women's-watches": 'Đồng hồ nữ',
  "men's-shirts": 'Áo sơ mi nam',
  "men's-shoes": 'Giày nam',
  "men's-watches": 'Đồng hồ nam',
  sunglasses: 'Kính mát',
  automotive: 'Phụ kiện ô tô',
  motorcycle: 'Xe máy',
  lighting: 'Đèn chiếu sáng',
  'mobile-accessories': 'Phụ kiện điện thoại',
  'kitchen-accessories': 'Phụ kiện nhà bếp',
  'sports-accessories': 'Phụ kiện thể thao',
  vehicle: 'Phương tiện',
}

const ROLE_LABELS = {
  admin: 'Quản trị viên',
  customer: 'Khách hàng',
  user: 'Người dùng',
}

const PAYMENT_STATUS_LABELS = {
  paid: 'Đã thanh toán',
  unpaid: 'Chưa thanh toán',
  refunded: 'Đã hoàn tiền',
  failed: 'Thất bại',
  pending: 'Đang chờ',
}

const ORDER_STATUS_LABELS = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  failed: 'Thất bại',
}

const SOURCE_LABELS = {
  api: 'API',
  mock: 'Dữ liệu giả lập',
  failed: 'Thất bại',
  local: 'Cục bộ',
  remote: 'Từ API',
  none: 'Chưa có',
  empty: 'Trống',
  products: 'Nguồn sản phẩm',
  users: 'Nguồn khách hàng',
  orders: 'Nguồn đơn hàng',
  dashboard: 'Bảng điều khiển',
}

const SHIPPING_PATTERNS = [
  [/\b1\s*-\s*2\s*day(s)?\b/i, '1-2 ngày'],
  [/\b2\s*-\s*4\s*day(s)?\b/i, '2-4 ngày'],
  [/\b4\s*-\s*6\s*day(s)?\b/i, '4-6 ngày'],
  [/\bafter\s*7\s*day(s)?\b/i, 'Sau 7 ngày'],
  [/\bships?\s*in\s*1\s*week\b/i, 'Giao hàng trong 1 tuần'],
  [/\bships?\s*in\s*2\s*weeks?\b/i, 'Giao hàng trong 2 tuần'],
  [/\bfree\s*shipping\b/i, 'Miễn phí vận chuyển'],
]

const WARRANTY_PATTERNS = [
  [/\b1\s*month\b/i, '1 tháng'],
  [/\b3\s*months?\b/i, '3 tháng'],
  [/\b6\s*months?\b/i, '6 tháng'],
  [/\b12\s*months?\b/i, '12 tháng'],
  [/\b1\s*year\b/i, '1 năm'],
  [/\b2\s*years?\b/i, '2 năm'],
  [/\b3\s*years?\b/i, '3 năm'],
]

const RETURN_PATTERNS = [
  [/\b30\s*days?\b/i, '30 ngày'],
  [/\b60\s*days?\b/i, '60 ngày'],
  [/\b90\s*days?\b/i, '90 ngày'],
  [/\b120\s*days?\b/i, '120 ngày'],
  [/\b14\s*days?\b/i, '14 ngày'],
  [/\bno\s*return\b/i, 'Không hỗ trợ đổi trả'],
]

function normalizeText(value, fallback = '') {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function normalizeKey(value) {
  return normalizeText(value).toLowerCase()
}

function formatPolicyLabel(value, patterns, fallback = 'Chưa cập nhật') {
  const text = normalizeText(value, '')

  if (!text) {
    return fallback
  }

  const normalized = normalizeKey(text)

  for (const [pattern, replacement] of patterns) {
    if (pattern.test(normalized)) {
      return replacement
    }
  }

  if (/[a-z]/i.test(text) && !/[đăâêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụýỳỷỹỵ]/i.test(text)) {
    return fallback
  }

  return text
}

function toTitleCase(value) {
  return normalizeText(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export function formatAdminStatus(value, fallback = 'Không xác định') {
  const normalized = normalizeKey(value)

  if (!normalized) {
    return fallback
  }

  if (STATUS_LABELS[normalized]) {
    return STATUS_LABELS[normalized]
  }

  if (normalized.includes('đang bán') || normalized.includes('dang ban')) {
    return 'Đang bán'
  }

  if (normalized.includes('ngừng bán') || normalized.includes('ngung ban')) {
    return 'Ngừng bán'
  }

  if (normalized.includes('đang hoạt động') || normalized.includes('dang hoat dong')) {
    return 'Đang hoạt động'
  }

  if (normalized.includes('ngừng hoạt động') || normalized.includes('ngung hoat dong')) {
    return 'Ngừng hoạt động'
  }

  return fallback
}

export function formatAdminAvailabilityStatus(value, fallback = 'Chưa cập nhật') {
  const normalized = normalizeKey(value)

  if (!normalized) {
    return fallback
  }

  if (AVAILABILITY_STATUS_LABELS[normalized]) {
    return AVAILABILITY_STATUS_LABELS[normalized]
  }

  if (normalized.includes('còn hàng') || normalized.includes('con hang')) {
    return 'Còn hàng'
  }

  if (normalized.includes('sắp hết hàng') || normalized.includes('sap het hang')) {
    return 'Sắp hết hàng'
  }

  if (normalized.includes('hết hàng') || normalized.includes('het hang')) {
    return 'Hết hàng'
  }

  if (normalized.includes('ngừng bán') || normalized.includes('ngung ban')) {
    return 'Ngừng bán'
  }

  return fallback
}

export function formatAdminCategoryLabel(value, fallback = 'Danh mục khác') {
  const normalized = normalizeKey(value)

  if (!normalized) {
    return fallback
  }

  if (CATEGORY_LABELS[normalized]) {
    return CATEGORY_LABELS[normalized]
  }

  const compact = normalized.replace(/[-_]+/g, ' ')

  for (const [key, label] of Object.entries(CATEGORY_LABELS)) {
    if (compact === key.replace(/[-_]+/g, ' ')) {
      return label
    }
  }

  if (compact.includes('phone')) {
    return 'Điện thoại'
  }

  if (compact.includes('laptop')) {
    return 'Máy tính xách tay'
  }

  if (compact.includes('tablet')) {
    return 'Máy tính bảng'
  }

  if (compact.includes('audio') || compact.includes('headphone')) {
    return 'Âm thanh'
  }

  if (compact.includes('accessor')) {
    return 'Phụ kiện'
  }

  if (compact.includes('beauty')) {
    return 'Làm đẹp'
  }

  if (compact.includes('fragrance')) {
    return 'Nước hoa'
  }

  if (compact.includes('furniture')) {
    return 'Nội thất'
  }

  if (compact.includes('grocery')) {
    return 'Đồ tạp hóa'
  }

  return toTitleCase(value) || fallback
}

export function formatAdminRoleLabel(value, fallback = 'Người dùng') {
  const normalized = normalizeKey(value)
  return ROLE_LABELS[normalized] ?? fallback
}

export function formatAdminOrderStatus(value, fallback = 'Khác') {
  const normalized = normalizeKey(value)
  return ORDER_STATUS_LABELS[normalized] ?? fallback
}

export function formatAdminPaymentStatus(value, fallback = 'Khác') {
  const normalized = normalizeKey(value)
  return PAYMENT_STATUS_LABELS[normalized] ?? fallback
}

export function formatAdminSourceLabel(value, fallback = 'Nguồn dữ liệu') {
  const normalized = normalizeKey(value)
  return SOURCE_LABELS[normalized] ?? fallback
}

export function formatAdminShipping(value, fallback = 'Chưa cập nhật') {
  return formatPolicyLabel(value, SHIPPING_PATTERNS, fallback)
}

export function formatAdminWarranty(value, fallback = 'Chưa cập nhật') {
  return formatPolicyLabel(value, WARRANTY_PATTERNS, fallback)
}

export function formatAdminReturnPolicy(value, fallback = 'Chưa cập nhật') {
  return formatPolicyLabel(value, RETURN_PATTERNS, fallback)
}

export function formatAdminDate(value, fallback = '—') {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return fallback
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}
