import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { SiteHeader } from './components/layout/SiteHeader'
import { SubNav } from './components/layout/SubNav'
import { SiteFooter } from './shared/layout/SiteFooter'
import { CompareTray } from './shared/ui/CompareTray'
import { QuickContactButtons } from './shared/ui/QuickContactButtons'
import { HomeDataProvider } from './context/HomeDataProvider'
import { ROUTES } from './config/routes'
import { hasAuthSession } from './utils/authStorage'
import { useRouteCategorySync } from './hooks/useRouteCategorySync'
import { useScrollShadow } from './hooks/useScrollShadow'
import { getCategoryCollectionPath } from './utils/categoryRoutes'
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
const AccountPage = lazy(() => import('./features/account/AccountPage'))
const AccountPasswordPage = lazy(() => import('./features/account/AccountPasswordPage'))
const AccountAddressPage = lazy(() => import('./features/account/AccountAddressPage'))
const AccountOrdersPage = lazy(() => import('./features/account/AccountOrdersPage'))
const OrderDetailPage = lazy(() => import('./features/account/OrderDetailPage'))
const NotFoundPage = lazy(() => import('./shared/ui/NotFoundPage'))

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

function RequireAuth({ children }) {
  const location = useLocation()

  if (!hasAuthSession()) {
    return <Navigate replace to={ROUTES.LOGIN} state={{ from: `${location.pathname}${location.search}` }} />
  }

  return children
}

function AppShell() {
  useRouteCategorySync()
  const location = useLocation()
  const isScrolled = useScrollShadow()
  const isCheckoutRoute = location.pathname === ROUTES.CHECKOUT
  const headerRef = useRef(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  useLayoutEffect(() => {
    const headerEl = headerRef.current
    if (!headerEl) return

    const updateHeaderHeight = () => {
      setHeaderHeight(headerEl.offsetHeight)
    }

    updateHeaderHeight()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateHeaderHeight)

      return () => window.removeEventListener('resize', updateHeaderHeight)
    }

    const observer = new ResizeObserver(() => {
      updateHeaderHeight()
    })

    observer.observe(headerEl)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div
      className={`app-shell${isCheckoutRoute ? ' app-shell--checkout' : ''}`}
      style={{
        '--site-header-height': `${headerHeight}px`,
      }}
    >
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
      <ScrollToTop />
      {isCheckoutRoute ? null : (
        <div ref={headerRef} className="site-header">
          <SiteHeader isScrolled={isScrolled} />
        </div>
      )}
      {isCheckoutRoute ? null : (
        <div className="site-subnav">
          <SubNav />
        </div>
      )}
      <main className={`app-shell__content${isCheckoutRoute ? ' app-shell__content--checkout' : ''}`}>
        <Suspense fallback={<PageLoader />}>
          {isCheckoutRoute ? (
            <Routes>
              <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
            </Routes>
          ) : (
            <div className="site-container">
              <Routes>
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
                <Route
                  path={ROUTES.ACCOUNT}
                  element={
                    <RequireAuth>
                      <AccountPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path={ROUTES.ACCOUNT_PASSWORD}
                  element={
                    <RequireAuth>
                      <AccountPasswordPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path={ROUTES.ACCOUNT_ADDRESS}
                  element={
                    <RequireAuth>
                      <AccountAddressPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path={ROUTES.ACCOUNT_ORDERS}
                  element={
                    <RequireAuth>
                      <AccountOrdersPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path={ROUTES.ACCOUNT_ORDER_DETAIL}
                  element={
                    <RequireAuth>
                      <OrderDetailPage />
                    </RequireAuth>
                  }
                />
                <Route path={ROUTES.ACCOUNT_LEGACY} element={<Navigate to={ROUTES.ACCOUNT} replace />} />
                <Route path={ROUTES.ACCOUNT_PASSWORD_LEGACY} element={<Navigate to={ROUTES.ACCOUNT_PASSWORD} replace />} />
                <Route path={ROUTES.ACCOUNT_ADDRESS_LEGACY} element={<Navigate to={ROUTES.ACCOUNT_ADDRESS} replace />} />
                <Route path={ROUTES.ACCOUNT_ORDERS_LEGACY} element={<Navigate to={ROUTES.ACCOUNT_ORDERS} replace />} />
                <Route path={ROUTES.ACCOUNT_ORDER_DETAIL_LEGACY} element={<Navigate to={ROUTES.ACCOUNT_ORDER_DETAIL} replace />} />
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.LOGIN_LEGACY} element={<Navigate to={ROUTES.LOGIN} replace />} />
                <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                <Route path={ROUTES.REGISTER_LEGACY} element={<Navigate to={ROUTES.REGISTER} replace />} />
                <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
                <Route path={ROUTES.CHECKOUT_LEGACY} element={<Navigate to={ROUTES.CHECKOUT} replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          )}
        </Suspense>
      </main>
      {isCheckoutRoute ? null : <QuickContactButtons />}
      {isCheckoutRoute ? null : <CompareTray />}
      {isCheckoutRoute ? null : <SiteFooter />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <HomeDataProvider>
        <AppShell />
      </HomeDataProvider>
    </BrowserRouter>
  )
}

export default App
