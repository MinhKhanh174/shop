import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { ROUTES } from '../../config/routes'
import { supportLinks } from '../../data/siteConfig'
import { CategoryMenu } from './CategoryMenu'
import { useHomeData } from '../../hooks/useHomeData'
import { useHomeStore } from '../../store/useHomeStore'

export function SubNav() {
  const remote = useHomeData()
  const location = useLocation()
  const isHomeRoute = location.pathname === ROUTES.HOME
  const isCategoryMenuOpen = useHomeStore((state) => state.isCategoryMenuOpen)
  const openCategoryMenu = useHomeStore((state) => state.openCategoryMenu)
  const closeCategoryMenu = useHomeStore((state) => state.closeCategoryMenu)
  const toggleCategoryMenu = useHomeStore((state) => state.toggleCategoryMenu)
  const isMenuActive = isHomeRoute || isCategoryMenuOpen
  const closeTimerRef = useRef(null)
  const closeDelayMs = 60

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const openSubnavMenu = () => {
    if (isHomeRoute) {
      return
    }

    clearCloseTimer()
    openCategoryMenu()
  }

  const scheduleCloseSubnavMenu = () => {
    if (isHomeRoute) {
      return
    }

    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => {
      closeCategoryMenu()
    }, closeDelayMs)
  }

  useEffect(() => {
    return () => clearCloseTimer()
  }, [])

  return (
    <div className="subnav" aria-label="Điều hướng nhanh">
      <div className="subnav__catalog-wrap" onMouseEnter={openSubnavMenu} onMouseLeave={scheduleCloseSubnavMenu}>
        <button
          type="button"
          className={`catalog-button${isMenuActive ? ' is-active' : ''}`}
          onClick={() => {
            if (!isHomeRoute) {
              toggleCategoryMenu()
            }
          }}
          aria-expanded={isMenuActive}
          aria-controls="category-menu"
          aria-disabled={isHomeRoute}
        >
          <Menu size={24} />
          <span>DANH MỤC SẢN PHẨM</span>
        </button>

        {!isHomeRoute && isCategoryMenuOpen ? (
          <div className="subnav__category-panel" onMouseEnter={openSubnavMenu} onMouseLeave={scheduleCloseSubnavMenu}>
            <CategoryMenu remoteProducts={remote.products} categoryItems={remote.categoryItems} linkMode="route" />
          </div>
        ) : null}
      </div>

      <div className="support-links">
        {supportLinks.map((item) => (
          <Link key={item.label} to={item.to ?? ROUTES.HOME}>
            <item.icon size={20} strokeWidth={2} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
