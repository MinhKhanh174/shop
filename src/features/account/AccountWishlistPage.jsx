import { Link } from 'react-router-dom'
import AccountLayout from './AccountLayout'
import './account.css'
import { ROUTES } from '../../config/routes'
import { getAuthUser } from '../../utils/authStorage'
import { loadAddresses } from '../../utils/addressStorage'
import { useWishlistStore } from '../../store/useWishlistStore'
import { ProductCard } from '../../shared/ui/ProductCard'

export default function AccountWishlistPage() {
  const currentUser = getAuthUser()
  const addressCount = loadAddresses(currentUser).length
  const wishlistItems = useWishlistStore((state) => state.wishlistItems)

  return (
    <div className="account-page">
      <div className="account-page__inner">
        <nav className="account-page__breadcrumb" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME}>Trang chủ</Link>
          <span>/</span>
          <Link to={ROUTES.ACCOUNT}>Tài khoản</Link>
          <span>/</span>
          <strong>Yêu thích</strong>
        </nav>

        <AccountLayout activeMenu="wishlist" user={currentUser} addressCount={addressCount}>
          <section className="account-page__wishlist-panel">
            <h2 className="account-page__panel-title">Yêu thích</h2>

            {wishlistItems.length > 0 ? (
              <div className="category-product-grid account-page__wishlist-grid" aria-label="Danh sách sản phẩm yêu thích">
                {wishlistItems.map((product) => (
                  <ProductCard key={product.id} product={product} compact />
                ))}
              </div>
            ) : (
              <div className="account-page__notice">
                <p className="account-page__notice-title">Bạn chưa có sản phẩm yêu thích</p>
                <p className="account-page__notice-text">
                  Hãy bấm biểu tượng trái tim ở trang sản phẩm để lưu lại những món bạn thích nhất.
                </p>
                <div className="account-page__actions">
                  <Link to={ROUTES.PRODUCTS} className="account-page__button account-page__button--primary">
                    Xem sản phẩm
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
