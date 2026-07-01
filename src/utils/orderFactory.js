const DEFAULT_ORDER_STATUS = 'pending'

function normalizeText(value, fallback = '') {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function normalizeQuantity(value) {
  const quantity = Number(value)

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 1
  }

  return Math.max(1, Math.round(quantity))
}

function normalizePrice(value) {
  const price = Number(value)

  if (!Number.isFinite(price) || Number.isNaN(price)) {
    return 0
  }

  return Math.round(price)
}

function buildOrderAddress(customer) {
  return [customer?.address, customer?.wardName, customer?.districtName, customer?.provinceName]
    .map((value) => normalizeText(value))
    .filter(Boolean)
    .join(', ')
}

function getPaymentStatus(paymentMethod) {
  const normalizedMethod = normalizeText(paymentMethod).toLowerCase()

  if (!normalizedMethod) {
    return 'Chua xac dinh'
  }

  if (normalizedMethod.includes('cod') || normalizedMethod.includes('nhan hang')) {
    return 'Cho thanh toan'
  }

  return 'Cho chuyen khoan'
}

function getShippingStatus(status) {
  switch (normalizeText(status, DEFAULT_ORDER_STATUS)) {
    case 'completed':
      return 'Da giao'
    case 'shipping':
      return 'Dang giao'
    case 'confirmed':
      return 'Da xac nhan'
    default:
      return 'Cho xac nhan'
  }
}

export function normalizeOrderItem(item, index = 0) {
  const source = item && typeof item === 'object' ? item : {}

  return {
    id: source.id ?? `item-${Date.now()}-${index}`,
    name: normalizeText(source.name ?? source.title, 'San pham'),
    price: normalizePrice(source.price),
    quantity: normalizeQuantity(source.quantity),
    image: source.image ?? source.thumbnail ?? null,
    brand: normalizeText(source.brand, ''),
    variant: normalizeText(source.variant, ''),
  }
}

export function buildCheckoutOrder({
  customer,
  items = [],
  subtotal = 0,
  shippingFee = 0,
  discount = 0,
  grandTotal = 0,
  paymentMethod = '',
  status = DEFAULT_ORDER_STATUS,
  note = '',
  id,
  createdAt,
}) {
  const normalizedCustomer = {
    email: normalizeText(customer?.email).toLowerCase(),
    fullName: normalizeText(customer?.fullName),
    phone: normalizeText(customer?.phone),
    address: normalizeText(customer?.address),
    provinceCode: normalizeText(customer?.provinceCode),
    provinceName: normalizeText(customer?.provinceName),
    districtCode: normalizeText(customer?.districtCode),
    districtName: normalizeText(customer?.districtName),
    wardCode: normalizeText(customer?.wardCode),
    wardName: normalizeText(customer?.wardName),
    province: normalizeText(customer?.province),
    district: normalizeText(customer?.district),
    ward: normalizeText(customer?.ward),
    country: normalizeText(customer?.country),
    note: normalizeText(note),
  }

  const normalizedItems = Array.isArray(items) ? items.map((item, index) => normalizeOrderItem(item, index)) : []
  const nextSubtotal = normalizePrice(subtotal)
  const nextShippingFee = normalizePrice(shippingFee)
  const nextDiscount = normalizePrice(discount)
  const nextGrandTotal = normalizePrice(grandTotal || nextSubtotal + nextShippingFee - nextDiscount)
  const nextStatus = normalizeText(status, DEFAULT_ORDER_STATUS)

  return {
    id: normalizeText(id),
    customer: normalizedCustomer,
    items: normalizedItems,
    subtotal: nextSubtotal,
    shippingFee: nextShippingFee,
    discount: nextDiscount,
    grandTotal: nextGrandTotal,
    paymentMethod: normalizeText(paymentMethod),
    status: nextStatus,
    createdAt: normalizeText(createdAt),
    address: buildOrderAddress(normalizedCustomer),
    paymentStatus: getPaymentStatus(paymentMethod),
    shippingStatus: getShippingStatus(nextStatus),
  }
}

export function createCheckoutOrder(payload) {
  return buildCheckoutOrder({
    ...payload,
    id:
      payload?.id ??
      `DH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    createdAt: payload?.createdAt ?? new Date().toISOString(),
  })
}

