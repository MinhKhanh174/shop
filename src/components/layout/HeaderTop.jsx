import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MapPin, Menu, Phone, ShoppingCart, User } from 'lucide-react'
import { CategoryMenu } from './CategoryMenu'
import logoSrc from '../../assets/logo.webp'
import { topActions } from '../../data/siteConfig'
import { ROUTES } from '../../config/routes'
import { useHomeData } from '../../hooks/useHomeData'
import { useCartStore } from '../../store/useCartStore'
import { useHomeStore } from '../../store/useHomeStore'
import { SearchBar } from './SearchBar'

const actionIcons = {
  phone: Phone,
  'map-pin': MapPin,
  user: User,
}

export function HeaderTop({ isScrolled = false }) {
  const itemCount = useCartStore((state) => state.getItemCount())
  const remote = useHomeData()
  const location = useLocation()
  const isHomeRoute = location.pathname === ROUTES.HOME
  const isCategoryMenuOpen = useHomeStore((state) => state.isCategoryMenuOpen)
  const openCategoryMenu = useHomeStore((state) => state.openCategoryMenu)
  const closeCategoryMenu = useHomeStore((state) => state.closeCategoryMenu)
  const toggleCategoryMenu = useHomeStore((state) => state.toggleCategoryMenu)
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false)
  const closeTimerRef = useRef(null)

  const clearHeaderMenuTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const openHeaderMenu = () => {
    clearHeaderMenuTimer()
    if (!isHomeRoute) {
      openCategoryMenu()
    }
    setIsHeaderMenuOpen(true)
  }

  const scheduleCloseHeaderMenu = () => {
    clearHeaderMenuTimer()
    closeTimerRef.current = window.setTimeout(() => {
      setIsHeaderMenuOpen(false)
      if (!isHomeRoute) {
        closeCategoryMenu()
      }
    }, 120)
  }

  useEffect(() => {
    return () => clearHeaderMenuTimer()
  }, [])

  const handleCatalogClick = () => {
    if (!isHomeRoute) {
      toggleCategoryMenu()
    }
  }

  return (
    <header className={`header${isScrolled ? ' header--scrolled' : ''}`}>
      <div className="header__top">
        <div
          className="header-brand-swap"
          aria-label="Logo và danh mục sản phẩm"
          onMouseEnter={openHeaderMenu}
          onMouseLeave={scheduleCloseHeaderMenu}
        >
          <Link to={ROUTES.HOME} className={`brand header-brand-swap__logo${isScrolled ? ' is-hidden' : ''}`}>
            <img src={logoSrc} alt="techstore" className="brand__logo" />
          </Link>

          <button
            type="button"
            className={`catalog-button catalog-button--header header-brand-swap__catalog${isScrolled ? ' is-visible' : ''}`}
            onClick={handleCatalogClick}
            onMouseEnter={openHeaderMenu}
            onFocus={openHeaderMenu}
            aria-expanded={isHomeRoute || isCategoryMenuOpen || isHeaderMenuOpen}
            aria-controls="category-menu"
            aria-disabled={isHomeRoute}
          >
            <Menu size={24} />
            <span>DANH MỤC SẢN PHẨM</span>
          </button>

          {isScrolled && isHeaderMenuOpen ? (
            <div
              className="header-brand-swap__panel"
              onMouseEnter={openHeaderMenu}
              onMouseLeave={scheduleCloseHeaderMenu}
            >
              <CategoryMenu remoteProducts={remote.products} categoryItems={remote.categoryItems} />
            </div>
          ) : null}
        </div>

        <SearchBar />

        <div className="header__actions">
          {topActions.map((item) => {
            const Icon = actionIcons[item.iconKey]

            return (
              <div key={item.id} className="header-action">
                {Icon ? <Icon size={18} /> : null}
                <div>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              </div>
            )
          })}

          <Link to={ROUTES.CART} className="cart-chip" aria-label="Giỏ hàng">
            <div className="cart-icon-wrapper" aria-hidden="true">
              <ShoppingCart size={20} />
              <span className="cart-chip__count">{itemCount}</span>
            </div>
            <span className="cart-chip__label">Giỏ hàng</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
