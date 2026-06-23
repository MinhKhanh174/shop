import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AccountLayout from './AccountLayout'
import './account.css'
import { ROUTES } from '../../config/routes'
import { getAuthUser } from '../../utils/authStorage'
import { getOrderById } from '../../services/orderApi'
import { formatCurrency } from '../../utils/formatCurrency'
import { loadAddresses } from '../../utils/addressStorage'

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

  return (
    <div className="account-page">
      <div className="account-page__inner">
        <nav className="account-page__breadcrumb" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME}>Trang chủ</Link>
          <span>/</span>
          <Link to={ROUTES.ACCOUNT}>Trang khách hàng</Link>
          <span>/</span>
          <Link to={ROUTES.ACCOUNT_ORDERS}>Đơn hàng của bạn</Link>
          <span>/</span>
          <strong>{orderId}</strong>
        </nav>

        <AccountLayout activeMenu="orders" user={currentUser} addressCount={addressCount}>
          <section className="account-page__detail-card">
            <h2 className="account-page__panel-title" style={{ marginBottom: '8px' }}>
              Chi tiết đơn hàng
            </h2>
            {order ? (
              <>
                <p className="account-page__panel-description">
                  Đơn hàng {order.id} được đồng bộ từ nguồn dữ liệu hiện có của dự án.
                </p>

                <div className="account-page__detail-grid">
                  <div className="account-page__detail-item">
                    <span>Trạng thái</span>
                    <strong>{order.paymentStatus ?? 'Đang xử lý'}</strong>
                  </div>
                  <div className="account-page__detail-item">
                    <span>Tổng tiền</span>
                    <strong>
                      {typeof order.grandTotal === 'number'
                        ? formatCurrency(order.grandTotal)
                        : typeof order.total === 'number'
                          ? formatCurrency(order.total)
                          : '---'}
                    </strong>
                  </div>
                  <div className="account-page__detail-item">
                    <span>Người nhận</span>
                    <strong>{order.customer?.fullName || currentUser?.firstName || currentUser?.email || 'Khách hàng'}</strong>
                  </div>
                  <div className="account-page__detail-item">
                    <span>Thanh toán</span>
                    <strong>{order.paymentMethod ?? 'Thanh toán khi nhận hàng'}</strong>
                  </div>
                </div>
              </>
            ) : (
              <p className="account-page__panel-description">
                Không tìm thấy đơn hàng phù hợp. Dữ liệu đơn hàng hiện được lấy từ nguồn lưu trữ hiện có của dự án.
              </p>
            )}
          </section>
        </AccountLayout>
      </div>
    </div>
  )
}
