import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AccountLayout from './AccountLayout'
import './account.css'
import { ROUTES, buildAccountOrderPath } from '../../config/routes'
import { getAuthUser } from '../../utils/authStorage'
import { loadAddresses } from '../../utils/addressStorage'
import { loadOrders } from '../../services/orderApi'
import { formatCurrency } from '../../utils/formatCurrency'

const orderColumns = ['Đơn hàng', 'Ngày', 'Địa chỉ', 'Giá trị đơn hàng', 'TT thanh toán', 'TT vận chuyển']

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
    return Number.isNaN(date.getTime())
      ? order.createdAt
      : date.toLocaleDateString('vi-VN')
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
            <h2 className="account-page__panel-title">Đơn hàng của bạn</h2>

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
                  <Link
                    key={order.id}
                    to={buildAccountOrderPath(order.id)}
                    className="account-page__orders-row account-page__orders-row--link"
                    role="row"
                  >
                    <div className="account-page__orders-cell" role="cell">
                      {order.id}
                    </div>
                    <div className="account-page__orders-cell" role="cell">
                      {renderOrderDate(order)}
                    </div>
                    <div className="account-page__orders-cell" role="cell">
                      {order.address}
                    </div>
                    <div className="account-page__orders-cell" role="cell">
                      {renderOrderTotal(order)}
                    </div>
                    <div className="account-page__orders-cell" role="cell">
                      {order.paymentStatus}
                    </div>
                    <div className="account-page__orders-cell" role="cell">
                      {order.shippingStatus}
                    </div>
                  </Link>
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
