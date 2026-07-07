import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HomeDataProvider } from './context/HomeDataProvider'
import { ROUTES } from './constants/routes'
import { hasAuthSession } from './utils/authStorage'
import { bootstrapAuthSession } from './utils/authBootstrap'
import { getCategoryCollectionPath } from './utils/categoryRoutes'
import './store/useWishlistStore'
import './App.css'

const HomePage = lazy(() => import('./features/home/HomePage'))
const CategoryPage = lazy(() => import('./features/category/CategoryPage'))
const ProductListPage = lazy(() => import('./features/product/ProductListPage'))
const ProductDetailPage = lazy(() => import('./features/product/ProductDetailPage'))
const NewsPage = lazy(() => import('./features/news/NewsPage'))
const TipsPage = lazy(() => import('./features/tips/TipsPage'))
const BlogDetailPage = lazy(() => import('./features/blog/BlogDetailPage'))
const SellUsedGuidePage = lazy(() => import('./features/guides/SellUsedGuidePage'))
const BuyOnlineGuidePage = lazy(() => import('./features/guides/BuyOnlineGuidePage'))
const InstallmentGuidePage = lazy(() => import('./features/guides/InstallmentGuidePage'))
const ComparePage = lazy(() => import('./features/product/ComparePage'))
const CartPage = lazy(() => import('./features/cart/CartPage'))
const CheckoutPage = lazy(() => import('./features/checkout/CheckoutPage'))
const StoreSystemPage = lazy(() => import('./features/store/StoreSystemPage'))
const LoginPage = lazy(() => import('./features/auth/LoginPage'))
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./features/auth/ResetPasswordPage'))
const AccountPage = lazy(() => import('./features/account/AccountPage'))
const AccountPasswordPage = lazy(() => import('./features/account/AccountPasswordPage'))
const AccountAddressPage = lazy(() => import('./features/account/AccountAddressPage'))
const AccountOrdersPage = lazy(() => import('./features/account/AccountOrdersPage'))
const AccountWishlistPage = lazy(() => import('./features/account/AccountWishlistPage'))
const OrderDetailPage = lazy(() => import('./features/account/OrderDetailPage'))
const NotFoundPage = lazy(() => import('./shared/ui/NotFoundPage'))
const StorefrontLayout = lazy(() => import('./shared/layout/StorefrontLayout'))
const RequireAdmin = lazy(() => import('./admin/routes/RequireAdmin'))
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout'))
const AdminDashboardPage = lazy(() => import('./admin/pages/AdminDashboardPage'))
const AdminProductsPage = lazy(() => import('./admin/pages/AdminProductsPage'))
const AdminOrdersPage = lazy(() => import('./admin/pages/AdminOrdersPage'))
const AdminUsersPage = lazy(() => import('./admin/pages/AdminUsersPage'))
const AdminSettingsPage = lazy(() => import('./admin/pages/AdminSettingsPage'))

function PageLoader() {
  return <div className="page-loader">Đang tải...</div>
}

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.search])

  return null
}

function LegacyCollectionRedirect() {
  const { categorySlug = '' } = useParams()

  return <Navigate replace to={getCategoryCollectionPath(categorySlug)} />
}

function LegacyProductRedirect() {
  const { productSlug = '' } = useParams()

  return <Navigate replace to={`${ROUTES.PRODUCTS}/${encodeURIComponent(productSlug)}`} />
}

function LegacySearchRedirect() {
  const location = useLocation()

  return <Navigate replace to={`${ROUTES.SEARCH}${location.search}`} />
}

function LegacyBlogRedirect() {
  return <Navigate replace to={ROUTES.BLOG_NEWS} />
}

function LegacyBlogDetailRedirect() {
  const { articleSlug = '' } = useParams()

  return <Navigate replace to={ROUTES.BLOG_DETAIL.replace(':articleSlug', encodeURIComponent(articleSlug))} />
}

function LegacyLoginRedirect() {
  const location = useLocation()

  return <Navigate replace state={location.state} to={ROUTES.LOGIN} />
}

function RequireAuth({ children }) {
  const location = useLocation()

  if (!hasAuthSession()) {
    return <Navigate replace to={ROUTES.LOGIN} state={{ from: `${location.pathname}${location.search}` }} />
  }

  return children
}

function AppRoutes() {
  const [, forceAuthRefresh] = useState(0)

  useEffect(() => {
    const handleAuthChanged = () => {
      forceAuthRefresh((current) => current + 1)
    }

    window.addEventListener('techstore:auth-changed', handleAuthChanged)

    return () => {
      window.removeEventListener('techstore:auth-changed', handleAuthChanged)
    }
  }, [])

  useEffect(() => {
    if (!hasAuthSession()) {
      return
    }

    void bootstrapAuthSession().catch((error) => {
      console.error('bootstrapAuthSession failed', error)
    })
  }, [])

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<StorefrontLayout />}>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.CATEGORY_DETAIL} element={<CategoryPage />} />
            <Route path={ROUTES.CATEGORIES} element={<Navigate to={getCategoryCollectionPath('featured')} replace />} />
            <Route path={ROUTES.CATEGORIES_LEGACY} element={<Navigate to={ROUTES.CATEGORIES} replace />} />
            <Route path={ROUTES.CATEGORY_DETAIL_LEGACY} element={<LegacyCollectionRedirect />} />
            <Route path={ROUTES.PRODUCTS} element={<ProductListPage />} />
            <Route path={ROUTES.PRODUCTS_LEGACY} element={<Navigate to={ROUTES.PRODUCTS} replace />} />
            <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetailPage />} />
            <Route path={ROUTES.PRODUCT_DETAIL_PRODUCTS_LEGACY} element={<LegacyProductRedirect />} />
            <Route path={ROUTES.SEARCH} element={<ProductListPage />} />
            <Route path={ROUTES.SEARCH_LEGACY} element={<LegacySearchRedirect />} />
            <Route path={ROUTES.BLOG} element={<Navigate to={ROUTES.BLOG_NEWS} replace />} />
            <Route path={ROUTES.BLOG_NEWS} element={<NewsPage />} />
            <Route path={ROUTES.BLOG_TIPS} element={<TipsPage />} />
            <Route path={ROUTES.BLOG_LEGACY} element={<LegacyBlogRedirect />} />
            <Route path={ROUTES.BLOG_NEWS_LEGACY} element={<Navigate to={ROUTES.BLOG_NEWS} replace />} />
            <Route path={ROUTES.BLOG_TIPS_LEGACY} element={<Navigate to={ROUTES.BLOG_TIPS} replace />} />
            <Route path={ROUTES.NEWS_LEGACY} element={<Navigate to={ROUTES.BLOG_NEWS} replace />} />
            <Route path={ROUTES.TIPS_LEGACY} element={<Navigate to={ROUTES.BLOG_TIPS} replace />} />
            <Route path={ROUTES.BLOG_DETAIL_LEGACY} element={<LegacyBlogDetailRedirect />} />
            <Route path={ROUTES.BLOG_DETAIL} element={<BlogDetailPage />} />
            <Route path={ROUTES.GUIDE_SELL_USED} element={<SellUsedGuidePage />} />
            <Route path={ROUTES.GUIDE_BUY_ONLINE} element={<BuyOnlineGuidePage />} />
            <Route path={ROUTES.GUIDE_INSTALLMENT} element={<InstallmentGuidePage />} />
            <Route path={ROUTES.STORE_SYSTEM} element={<StoreSystemPage />} />
            <Route path={ROUTES.COMPARE} element={<ComparePage />} />
            <Route path={ROUTES.COMPARE_LEGACY} element={<Navigate to={ROUTES.COMPARE} replace />} />
            <Route path={ROUTES.CART} element={<CartPage />} />
            <Route path={ROUTES.CART_LEGACY} element={<Navigate to={ROUTES.CART} replace />} />
            <Route path={ROUTES.ACCOUNT} element={<RequireAuth><AccountPage /></RequireAuth>} />
            <Route path={ROUTES.ACCOUNT_PASSWORD} element={<RequireAuth><AccountPasswordPage /></RequireAuth>} />
            <Route path={ROUTES.ACCOUNT_ADDRESS} element={<RequireAuth><AccountAddressPage /></RequireAuth>} />
            <Route path={ROUTES.ACCOUNT_ORDERS} element={<RequireAuth><AccountOrdersPage /></RequireAuth>} />
            <Route path={ROUTES.ACCOUNT_ORDER_DETAIL} element={<RequireAuth><OrderDetailPage /></RequireAuth>} />
            <Route path={ROUTES.ACCOUNT_WISHLIST} element={<RequireAuth><AccountWishlistPage /></RequireAuth>} />
            <Route path={ROUTES.ACCOUNT_LEGACY} element={<Navigate to={ROUTES.ACCOUNT} replace />} />
            <Route path={ROUTES.ACCOUNT_PASSWORD_LEGACY} element={<Navigate to={ROUTES.ACCOUNT_PASSWORD} replace />} />
            <Route path={ROUTES.ACCOUNT_ADDRESS_LEGACY} element={<Navigate to={ROUTES.ACCOUNT_ADDRESS} replace />} />
            <Route path={ROUTES.ACCOUNT_ORDERS_LEGACY} element={<Navigate to={ROUTES.ACCOUNT_ORDERS} replace />} />
            <Route path={ROUTES.ACCOUNT_ORDER_DETAIL_LEGACY} element={<Navigate to={ROUTES.ACCOUNT_ORDER_DETAIL} replace />} />
            <Route path={ROUTES.ACCOUNT_WISHLIST_LEGACY} element={<Navigate to={ROUTES.ACCOUNT_WISHLIST} replace />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.LOGIN_LEGACY} element={<LegacyLoginRedirect />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.REGISTER_LEGACY} element={<Navigate to={ROUTES.REGISTER} replace />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD_LEGACY} element={<Navigate to={ROUTES.RESET_PASSWORD} replace />} />
            <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
            <Route path={ROUTES.CHECKOUT_LEGACY} element={<Navigate to={ROUTES.CHECKOUT} replace />} />
          </Route>

          <Route path="/admin" element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="products" element={<Outlet />}>
                <Route index element={<AdminProductsPage />} />
                <Route path=":id" element={<AdminProductsPage />} />
              </Route>
              <Route path="orders" element={<Outlet />}>
                <Route index element={<AdminOrdersPage />} />
                <Route path=":id" element={<AdminOrdersPage />} />
              </Route>
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              {/*
                Future admin route skeleton:
                - /admin/customers
                - /admin/categories
                Add them here so they stay inside RequireAdmin + AdminLayout.
              */}
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <HomeDataProvider>
        <div className="app-shell">
          <AppRoutes />
        </div>
      </HomeDataProvider>
    </BrowserRouter>
  )
}

export default App
