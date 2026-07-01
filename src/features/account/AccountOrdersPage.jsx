import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AccountLayout from './AccountLayout'
import './account.css'
import { ROUTES, buildAccountOrderPath } from '../../constants/routes'
import { getAuthUser } from '../../utils/authStorage'
import { loadAddresses } from '../../utils/addressStorage'
import { loadOrders } from '../../services/orderApi'
import { formatCurrency } from '../../utils/formatCurrency'

const orderColumns = ['Đơn hàng', 'Ngày', 'Địa chỉ', 'Giá trị đơn hàng', 'TT thanh toán', 'TT vận chuyển']

function formatOrderNumber(orderId) {
  const normalized = String(orderId ?? '').trim()

  if (!normalized) {
    return '---'
  }

  return normalized.startsWith('#') ? normalized : `#${normalized}`
}

function buildOrderAddress(order) {
  const fromOrder = String(order?.address ?? '').trim()

  if (fromOrder) {
    return fromOrder
  }

  return [order?.customer?.address, order?.customer?.wardName, order?.customer?.districtName, order?.customer?.provinceName, order?.customer?.country]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .join(', ')
}

function formatOrderPaymentStatus(order) {
  const normalized = String(order?.paymentStatus ?? order?.paymentMethod ?? order?.status ?? '').trim().toLowerCase()

  if (!normalized || normalized.includes('pending') || normalized.includes('cho thanh toan')) {
    return 'Chưa thu tiền'
  }

  if (normalized.includes('cod') || normalized.includes('cash') || normalized.includes('nhan hang')) {
    return 'Chưa thu tiền'
  }

  if (normalized.includes('paid') || normalized.includes('da thanh toan') || normalized.includes('success')) {
    return 'Đã thu tiền'
  }

  return order?.paymentStatus ?? 'Chưa thu tiền'
}

function formatOrderShippingStatus(order) {
  const normalized = String(order?.shippingStatus ?? order?.status ?? '').trim().toLowerCase()

  if (!normalized || normalized.includes('pending') || normalized.includes('cho xac nhan')) {
    return 'Chưa chuyển'
  }

  if (normalized.includes('shipping') || normalized.includes('dang giao')) {
    return 'Đang chuyển'
  }

  if (normalized.includes('completed') || normalized.includes('da giao')) {
    return 'Đã chuyển'
  }

  return order?.shippingStatus ?? 'Chưa chuyển'
}

export default function AccountOrdersPage() {
  const currentUser = getAuthUser()
  const addressCount = loadAddresses(currentUser).length
  const [orders, setOrders] = useState([])

  useEffect(() => {
    let active = true

    loadOrders()
      .then((nextOrders) => {
        if (!active) {
          return
        }

        setOrders(Array.isArray(nextOrders) ? nextOrders : [])
      })
      .catch((error) => {
        console.error(error)
        if (active) {
          setOrders([])
        }
      })

    return () => {
      active = false
    }
  }, [])

  const renderOrderDate = (order) => {
    if (!order?.createdAt) {
      return order?.date ?? '---'
    }

    const date = new Date(order.createdAt)
    return Number.isNaN(date.getTime()) ? order.createdAt : date.toLocaleDateString('vi-VN')
  }

  const renderOrderTotal = (order) => {
    if (typeof order?.grandTotal === 'number') {
      return formatCurrency(order.grandTotal)
    }

    if (typeof order?.total === 'number') {
      return formatCurrency(order.total)
    }

    return order?.total ?? '---'
  }

  return (
    <div className="account-page">
      <div className="account-page__inner">
        <nav className="account-page__breadcrumb" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME}>Trang chủ</Link>
          <span>/</span>
          <Link to={ROUTES.ACCOUNT}>Tài khoản</Link>
          <span>/</span>
          <strong>Đơn hàng</strong>
        </nav>

        <AccountLayout activeMenu="orders" user={currentUser} addressCount={addressCount}>
          <section className="account-page__orders-panel">
            <h2 className="account-page__panel-title">ĐƠN HÀNG CỦA BẠN</h2>

            <div className="account-page__orders-table" role="table" aria-label="Danh sách đơn hàng">
              <div className="account-page__orders-row account-page__orders-row--head" role="row">
                {orderColumns.map((column) => (
                  <div key={column} className="account-page__orders-cell account-page__orders-cell--head" role="columnheader">
                    {column}
                  </div>
                ))}
              </div>

              {orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="account-page__orders-row account-page__orders-row--link" role="row">
                    <div className="account-page__orders-cell" role="cell">
                      <Link to={buildAccountOrderPath(order.id)} className="account-page__order-number-link">
                        {formatOrderNumber(order.id)}
                      </Link>
                    </div>
                    <div className="account-page__orders-cell" role="cell">
                      {renderOrderDate(order)}
                    </div>
                    <div className="account-page__orders-cell" role="cell">
                      {buildOrderAddress(order)}
                    </div>
                    <div className="account-page__orders-cell" role="cell">
                      <span className="account-page__order-total">{renderOrderTotal(order)}</span>
                    </div>
                    <div className="account-page__orders-cell" role="cell">
                      {formatOrderPaymentStatus(order)}
                    </div>
                    <div className="account-page__orders-cell" role="cell">
                      {formatOrderShippingStatus(order)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="account-page__orders-empty">Không có đơn hàng nào.</div>
              )}
            </div>
          </section>
        </AccountLayout>
      </div>
    </div>
  )
}
