import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MapPin, Menu, Phone, ShoppingCart, User } from 'lucide-react'
import Card from '../../shared/ui/Card'
import { CategoryMenu } from './CategoryMenu'
import logoSrc from '../../assets/logo.webp'
import { topActions } from '../../data/siteConfig'
import { ROUTES } from '../../config/routes'
import { useHomeData } from '../../hooks/useHomeData'
import { useCartStore } from '../../store/useCartStore'
import { useHomeStore } from '../../store/useHomeStore'
import { SearchBar } from './SearchBar'
import { formatCurrency } from '../../utils/currency'

const actionIcons = {
  phone: Phone,
  'map-pin': MapPin,
  user: User,
}

export function HeaderTop({ isScrolled = false }) {
  const cartItems = useCartStore((state) => state.cartItems)
  const itemCount = useCartStore((state) => state.getItemCount())
  const remote = useHomeData()
  const location = useLocation()
  const isHomeRoute = location.pathname === ROUTES.HOME
  const isCategoryMenuOpen = useHomeStore((state) => state.isCategoryMenuOpen)
  const openCategoryMenu = useHomeStore((state) => state.openCategoryMenu)
  const closeCategoryMenu = useHomeStore((state) => state.closeCategoryMenu)
  const toggleCategoryMenu = useHomeStore((state) => state.toggleCategoryMenu)
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false)
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false)
  const closeTimerRef = useRef(null)
  const cartPreviewTimerRef = useRef(null)
  const closeDelayMs = 60

  const clearHeaderMenuTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const clearCartPreviewTimer = () => {
    if (cartPreviewTimerRef.current) {
      window.clearTimeout(cartPreviewTimerRef.current)
      cartPreviewTimerRef.current = null
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
    }, closeDelayMs)
  }

  useEffect(() => {
    return () => {
      clearHeaderMenuTimer()
      clearCartPreviewTimer()
    }
  }, [])

  const handleCatalogClick = () => {
    if (!isHomeRoute) {
      toggleCategoryMenu()
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0)
  const previewItems = cartItems.slice(0, 2)

  return (
    <header className={`header${isScrolled ? ' header--scrolled' : ''}`}>
      <div className="header__top">
        <div className="header-brand-swap" aria-label="Logo và danh mục sản phẩm">
          <Link to={ROUTES.HOME} className={`brand header-brand-swap__logo${isScrolled ? ' is-hidden' : ''}`}>
            <img src={logoSrc} alt="techstore" className="brand__logo" />
          </Link>

          <button
            type="button"
            className={`catalog-button catalog-button--header header-brand-swap__catalog${isScrolled ? ' is-visible' : ''}`}
            onClick={handleCatalogClick}
            onMouseEnter={openHeaderMenu}
            aria-expanded={isHomeRoute || isCategoryMenuOpen || isHeaderMenuOpen}
            aria-controls="category-menu"
            aria-disabled={isHomeRoute}
          >
            <Menu size={24} />
            <span>DANH MỤC SẢN PHẨM</span>
          </button>

          {isHeaderMenuOpen ? (
            <div
              className="header-brand-swap__panel"
              onMouseEnter={openHeaderMenu}
              onMouseLeave={scheduleCloseHeaderMenu}
            >
              <CategoryMenu remoteProducts={remote.products} categoryItems={remote.categoryItems} linkMode="route" />
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
                  {item.links ? (
                    <>
                      {item.links.map((link) => (
                        <Link key={link.label} to={link.to} className="header-action__link">
                          {link.label}
                        </Link>
                      ))}
                    </>
                  ) : (
                    <strong>{item.value}</strong>
                  )}
                </div>
              </div>
            )
          })}

          <div
            className="cart-chip-wrap"
            onMouseEnter={() => {
              clearCartPreviewTimer()
              setIsCartPreviewOpen(true)
            }}
            onMouseLeave={() => {
              clearCartPreviewTimer()
              cartPreviewTimerRef.current = window.setTimeout(() => {
                setIsCartPreviewOpen(false)
              }, 120)
            }}
          >
            <Link
              to={ROUTES.CART}
              className="cart-chip"
              aria-label="Giỏ hàng"
              onFocus={() => setIsCartPreviewOpen(true)}
              onBlur={() => setIsCartPreviewOpen(false)}
            >
              <div className="cart-icon-wrapper" aria-hidden="true">
                <ShoppingCart size={18} />
                <span className="cart-chip__count">{itemCount}</span>
              </div>
              <span className="cart-chip__label">Giỏ hàng</span>
            </Link>

            {isCartPreviewOpen ? (
              <Card className="cart-preview">
                {cartItems.length > 0 ? (
                  <>
                    <div className="cart-preview__items">
                      {previewItems.map((item) => (
                        <div key={item.id} className="cart-preview__item">
                          <img src={item.image} alt={item.name} className="cart-preview__thumb" />
                          <div className="cart-preview__meta">
                            <p>{item.name}</p>
                            <span>
                              {item.brand || ' '} {item.quantity ? `x ${item.quantity}` : ''}
                            </span>
                            <strong>{formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0))}</strong>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="cart-preview__footer">
                      <p>
                        Tổng tiền tạm tính: <strong>{formatCurrency(totalPrice)}</strong>
                      </p>
                      <Link to={ROUTES.CART} className="cart-preview__checkout">
                        Tiến hành thanh toán
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="cart-preview__empty">Giỏ hàng đang trống.</div>
                )}
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
