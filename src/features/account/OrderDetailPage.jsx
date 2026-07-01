import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AccountLayout from './AccountLayout'
import './account.css'
import { ROUTES } from '../../constants/routes'
import { getAuthUser } from '../../utils/authStorage'
import { getOrderById } from '../../services/orderApi'
import { formatCurrency } from '../../utils/formatCurrency'
import { loadAddresses } from '../../utils/addressStorage'

function formatOrderNumber(orderId) {
  const normalized = String(orderId ?? '').trim()
  if (!normalized) {
    return '---'
  }
  return normalized.startsWith('#') ? normalized : `#${normalized}`
}

function formatDetailDate(value) {
  if (!value) {
    return '---'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleDateString('vi-VN')
}

function buildOrderAddress(order, currentUser) {
  const fromOrder = String(order?.address ?? '').trim()
  if (fromOrder) {
    return fromOrder
  }

  return [
    order?.customer?.fullName || currentUser?.firstName || currentUser?.email,
    order?.customer?.address,
    order?.customer?.wardName,
    order?.customer?.districtName,
    order?.customer?.provinceName,
    order?.customer?.country,
  ]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .join(', ')
}

function formatPaymentStatus(order) {
  const normalized = String(order?.paymentStatus ?? order?.paymentMethod ?? '').trim().toLowerCase()

  if (normalized.includes('cod') || normalized.includes('nhan hang') || normalized.includes('pending')) {
    return 'Chưa thanh toán'
  }

  if (normalized.includes('paid') || normalized.includes('da thanh toan') || normalized.includes('success')) {
    return 'Đã thanh toán'
  }

  return order?.paymentStatus || 'Chưa thanh toán'
}

function formatShippingStatus(order) {
  const normalized = String(order?.shippingStatus ?? order?.status ?? '').trim().toLowerCase()

  if (normalized.includes('shipping') || normalized.includes('dang giao')) {
    return 'Đang giao hàng'
  }

  if (normalized.includes('completed') || normalized.includes('da giao')) {
    return 'Đã giao hàng'
  }

  return 'Chưa giao hàng'
}

function buildNote(order) {
  return String(order?.customer?.note ?? order?.note ?? '').trim() || '---'
}

function renderMoney(value) {
  if (typeof value === 'number') {
    return formatCurrency(value)
  }

  const normalized = Number(value)
  return Number.isFinite(normalized) ? formatCurrency(normalized) : '0đ'
}

function ProductThumb({ item }) {
  if (item?.image) {
    return <img className="account-page__detail-thumb" src={item.image} alt={item.name} />
  }

  return <div className="account-page__detail-thumb account-page__detail-thumb--placeholder" aria-hidden="true" />
}

export default function OrderDetailPage() {
  const { orderId = '' } = useParams()
  const currentUser = getAuthUser()
  const addressCount = loadAddresses(currentUser).length
  const [order, setOrder] = useState(null)

  useEffect(() => {
    let active = true

    getOrderById(orderId)
      .then((nextOrder) => {
        if (active) {
          setOrder(nextOrder)
        }
      })
      .catch((error) => {
        console.error(error)
        if (active) {
          setOrder(null)
        }
      })

    return () => {
      active = false
    }
  }, [orderId])

  const items = Array.isArray(order?.items) ? order.items : []
  const grandTotal = typeof order?.grandTotal === 'number' ? order.grandTotal : Number(order?.total ?? 0)
  const discount = typeof order?.discount === 'number' ? order.discount : 0
  const shippingFee = typeof order?.shippingFee === 'number' ? order.shippingFee : 0
  const createdAtLabel = formatDetailDate(order?.createdAt)

  return (
    <div className="account-page">
      <div className="account-page__inner">
        <nav className="account-page__breadcrumb" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME}>Trang chủ</Link>
          <span>/</span>
          <Link to={ROUTES.ACCOUNT}>Tài khoản</Link>
          <span>/</span>
          <Link to={ROUTES.ACCOUNT_ORDERS}>Đơn hàng của bạn</Link>
          <span>/</span>
          <strong>{formatOrderNumber(orderId)}</strong>
        </nav>

        <AccountLayout activeMenu="orders" user={currentUser} addressCount={addressCount}>
          {order ? (
            <section className="account-page__detail-page">
              <div className="account-page__detail-header">
                <div className="account-page__detail-heading">
                  <h2 className="account-page__panel-title">Chi tiết đơn hàng {formatOrderNumber(order.id)}</h2>
                  <p className="account-page__detail-status-line">
                    <span>
                      Trạng thái thanh toán: <strong>{formatPaymentStatus(order)}</strong>
                    </span>
                    <span>
                      Trạng thái vận chuyển: <strong>{formatShippingStatus(order)}</strong>
                    </span>
                  </p>
                </div>

                <div className="account-page__detail-date">Ngày tạo: {createdAtLabel}</div>
              </div>

              <div className="account-page__detail-summary-grid">
                <div className="account-page__detail-box">
                  <div className="account-page__detail-box-title">ĐỊA CHỈ GIAO HÀNG</div>
                  <div className="account-page__detail-box-content">
                    <strong>{order.customer?.fullName || currentUser?.firstName || currentUser?.email || 'Khách hàng'}</strong>
                    <span>{buildOrderAddress(order, currentUser) || '---'}</span>
                    <span>Số điện thoại: {order.customer?.phone || currentUser?.phone || '---'}</span>
                  </div>
                </div>

                <div className="account-page__detail-box">
                  <div className="account-page__detail-box-title">THANH TOÁN</div>
                  <div className="account-page__detail-box-content">
                    <span>{order.paymentMethod || '---'}</span>
                  </div>
                </div>

                <div className="account-page__detail-box">
                  <div className="account-page__detail-box-title">GHI CHÚ</div>
                  <div className="account-page__detail-box-content">
                    <span>{buildNote(order)}</span>
                  </div>
                </div>
              </div>

              <div className="account-page__detail-table-card">
                <div className="account-page__detail-table" role="table" aria-label="Chi tiết sản phẩm trong đơn hàng">
                  <div className="account-page__detail-table-head" role="row">
                    <div className="account-page__detail-table-cell account-page__detail-table-cell--head" role="columnheader">
                      Sản phẩm
                    </div>
                    <div className="account-page__detail-table-cell account-page__detail-table-cell--head" role="columnheader">
                      Đơn giá
                    </div>
                    <div className="account-page__detail-table-cell account-page__detail-table-cell--head" role="columnheader">
                      Số lượng
                    </div>
                    <div className="account-page__detail-table-cell account-page__detail-table-cell--head" role="columnheader">
                      Tổng
                    </div>
                  </div>

                  {items.length > 0 ? (
                    items.map((item, index) => {
                      const price = typeof item?.price === 'number' ? item.price : 0
                      const quantity = typeof item?.quantity === 'number' ? item.quantity : 1
                      const lineTotal = price * quantity

                      return (
                        <div key={item?.id ?? `${item?.name ?? 'item'}-${index}`} className="account-page__detail-table-row" role="row">
                          <div className="account-page__detail-table-cell account-page__detail-product" role="cell">
                            <ProductThumb item={item} />
                            <div className="account-page__detail-product-info">
                              <div className="account-page__detail-product-name">{item?.name || 'Sản phẩm'}</div>
                              <div className="account-page__detail-product-variant">{item?.variant || item?.brand || ' '}</div>
                              <div className="account-page__detail-product-sku">Mã sản phẩm: {item?.id || '---'}</div>
                            </div>
                          </div>
                          <div className="account-page__detail-table-cell" role="cell">
                            {renderMoney(price)}
                          </div>
                          <div className="account-page__detail-table-cell" role="cell">
                            {quantity}
                          </div>
                          <div className="account-page__detail-table-cell" role="cell">
                            {renderMoney(lineTotal)}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="account-page__detail-empty">Không có sản phẩm trong đơn hàng này.</div>
                  )}
                </div>

                <div className="account-page__detail-totals">
                  <div className="account-page__detail-total-row">
                    <span>Khuyến mại</span>
                    <strong>{renderMoney(discount)}</strong>
                  </div>
                  <div className="account-page__detail-total-row">
                    <span>Phí vận chuyển</span>
                    <strong>
                      {shippingFee > 0 ? `${renderMoney(shippingFee)} (Giao hàng tận nơi)` : renderMoney(shippingFee)}
                    </strong>
                  </div>
                  <div className="account-page__detail-total-row account-page__detail-total-row--grand">
                    <span>Tổng tiền</span>
                    <strong>{renderMoney(grandTotal)}</strong>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="account-page__detail-page">
              <div className="account-page__detail-empty-state">
                <h2 className="account-page__panel-title">Chi tiết đơn hàng {formatOrderNumber(orderId)}</h2>
                <p className="account-page__panel-description">
                  Không tìm thấy đơn hàng phù hợp. Dữ liệu đơn hàng hiện được lấy từ nguồn lưu trữ hiện có của dự án.
                </p>
              </div>
            </section>
          )}
        </AccountLayout>
      </div>
    </div>
  )
}
