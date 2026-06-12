import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { supportLinks } from '../../data/siteConfig'
import { ROUTES } from '../../config/routes'
import { useHomeStore } from '../../store/useHomeStore'

export function SubNav() {
  const location = useLocation()
  const isHomeRoute = location.pathname === '/'
  const isCategoryMenuOpen = useHomeStore((state) => state.isCategoryMenuOpen)
  const toggleCategoryMenu = useHomeStore((state) => state.toggleCategoryMenu)
  const isMenuActive = isHomeRoute || isCategoryMenuOpen

  return (
    <div className="subnav" aria-label="Điều hướng nhanh">
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

      <div className="support-links">
        {supportLinks.map((item) => (
          <a key={item.label} href={isHomeRoute ? '#hero' : ROUTES.HOME}>
            <item.icon size={20} strokeWidth={2} />
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
