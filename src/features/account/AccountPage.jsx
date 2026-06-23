import { Link } from 'react-router-dom'
import AccountLayout from './AccountLayout'
import './account.css'
import { ROUTES } from '../../config/routes'
import { buildDisplayName, getAuthUser, hasAuthSession } from '../../utils/authStorage'
import { loadAddresses } from '../../utils/addressStorage'

export default function AccountPage() {
  const isAuthenticated = hasAuthSession()
  const currentUser = getAuthUser()
  const addressCount = loadAddresses(currentUser).length

  return (
    <div className="account-page">
      <div className="account-page__inner">
        <nav className="account-page__breadcrumb" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME}>Trang chủ</Link>
          <span>/</span>
          <strong>Tài khoản</strong>
        </nav>

        <AccountLayout activeMenu="info" user={currentUser} addressCount={addressCount}>
          <section className="account-page__panel">
            <h2 className="account-page__panel-title">Thông tin tài khoản</h2>

            {isAuthenticated ? (
              <div className="account-page__profile">
                <div className="account-page__profile-row">
                  <span className="account-page__profile-label">Họ tên:</span>
                  <span className="account-page__profile-value">{buildDisplayName(currentUser)}</span>
                </div>
                <div className="account-page__profile-row">
                  <span className="account-page__profile-label">Email:</span>
                  <span className="account-page__profile-value">{currentUser?.email || 'Chưa có email'}</span>
                </div>
                {currentUser?.phone ? (
                  <div className="account-page__profile-row">
                    <span className="account-page__profile-label">Số điện thoại:</span>
                    <span className="account-page__profile-value">{currentUser.phone}</span>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="account-page__notice">
                <p className="account-page__notice-title">Bạn chưa đăng nhập</p>
                <p className="account-page__notice-text">
                  Đăng nhập để xem thông tin tài khoản, theo dõi đơn hàng và quản lý địa chỉ nhận hàng.
                </p>
                <div className="account-page__actions">
                  <Link to={ROUTES.LOGIN} className="account-page__button account-page__button--primary">
                    Đăng nhập
                  </Link>
                  <Link to={ROUTES.REGISTER} className="account-page__button account-page__button--secondary">
                    Đăng ký
                  </Link>
                </div>
              </div>
            )}
          </section>
        </AccountLayout>
      </div>
    </div>
  )
}
