import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { SiteHeader } from './components/layout/SiteHeader'
import { SubNav } from './components/layout/SubNav'
import { SiteFooter } from './shared/layout/SiteFooter'
import { HomeDataProvider } from './context/HomeDataProvider'
import { ROUTES } from './config/routes'
import { useRouteCategorySync } from './hooks/useRouteCategorySync'
import { useScrollShadow } from './hooks/useScrollShadow'
import './App.css'

const HomePage = lazy(() => import('./features/home/HomePage'))
const CategoryPage = lazy(() => import('./features/category/CategoryPage'))
const ProductListPage = lazy(() => import('./features/product/ProductListPage'))
const ProductDetailPage = lazy(() => import('./features/product/ProductDetailPage'))
const ComparePage = lazy(() => import('./features/product/ComparePage'))
const CartPage = lazy(() => import('./features/cart/CartPage'))
const LoginPage = lazy(() => import('./features/auth/LoginPage'))
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

function AppShell() {
  useRouteCategorySync()
  const isScrolled = useScrollShadow()
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
      className="app-shell"
      style={{
        '--site-header-height': `${headerHeight}px`,
      }}
    >
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
      <ScrollToTop />
      <div ref={headerRef} className="site-header">
        <SiteHeader isScrolled={isScrolled} />
      </div>
      <div className="site-subnav">
        <SubNav />
      </div>
      <main className="app-shell__content">
        <div className="site-container">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.COLLECTION} element={<CategoryPage />} />
              <Route path={ROUTES.PRODUCTS} element={<ProductListPage />} />
              <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetailPage />} />
              <Route path={ROUTES.COMPARE} element={<ComparePage />} />
              <Route path={ROUTES.CART} element={<CartPage />} />
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      <SiteFooter />
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
