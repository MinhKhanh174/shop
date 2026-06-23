import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import { buildDisplayName } from '../../utils/authStorage'

function buildMenuItems(addressCount) {
  return [
    { key: 'info', label: 'Thông tin tài khoản', to: ROUTES.ACCOUNT },
    { key: 'orders', label: 'Đơn hàng của bạn', to: ROUTES.ACCOUNT_ORDERS },
    { key: 'password', label: 'Đổi mật khẩu', to: ROUTES.ACCOUNT_PASSWORD },
    { key: 'address', label: `Sổ địa chỉ (${addressCount})`, to: ROUTES.ACCOUNT_ADDRESS },
  ]
}

export default function AccountLayout({ activeMenu = 'info', user, addressCount = 0, children }) {
  const location = useLocation()
  const displayName = buildDisplayName(user)
  const menuItems = buildMenuItems(addressCount)

  const isActive = (item) => {
    if (item.key === activeMenu) {
      return true
    }

    if (item.to === ROUTES.ACCOUNT && location.pathname === ROUTES.ACCOUNT) {
      return item.key === 'info'
    }

    if (item.to === ROUTES.ACCOUNT_ORDERS && location.pathname.startsWith(ROUTES.ACCOUNT_ORDERS)) {
      return item.key === 'orders'
    }

    if (item.to === ROUTES.ACCOUNT_PASSWORD && location.pathname === ROUTES.ACCOUNT_PASSWORD) {
      return item.key === 'password'
    }

    if (item.to === ROUTES.ACCOUNT_ADDRESS && location.pathname === ROUTES.ACCOUNT_ADDRESS) {
      return item.key === 'address'
    }

    return false
  }

  return (
    <div className="account-page__layout">
      <aside className="account-page__sidebar">
        <h1 className="account-page__title">Trang tài khoản</h1>
        <p className="account-page__greeting">
          Xin chào, <strong>{displayName}</strong>!
        </p>

        <nav className="account-page__menu" aria-label="Điều hướng tài khoản">
          {menuItems.map((item) =>
            item.disabled ? (
              <button
                key={item.key}
                type="button"
                className="account-page__menu-button account-page__menu-button--muted"
                disabled
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.key}
                to={item.to}
                className={`account-page__menu-link${isActive(item) ? ' is-active' : ''}`}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </aside>

      <main className="account-page__content">{children}</main>
    </div>
  )
}
