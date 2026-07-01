import { ChevronRight, Gift } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useHomeStore } from '../../store/useHomeStore'
import { buildCategoryMegaGroups } from '../../utils/categoryMenuBuilder'
import { getCategoryCollectionPath } from '../../utils/categoryRoutes'
import { ROUTES } from '../../constants/routes'

function CategoryMegaPanel({ categoryKey, remoteProducts }) {
  const groups = useMemo(() => buildCategoryMegaGroups(remoteProducts, categoryKey), [remoteProducts, categoryKey])
  const setSelectedBrand = useHomeStore((state) => state.setSelectedBrand)

  if (!groups.length) return null

  return (
    <div className="category-menu__mega" aria-label="Danh mục con">
      {groups.map((group) => (
        <div key={group.title} className="category-menu__mega-group">
          <h3>{group.title}</h3>
          <ul>
            {group.items.map((item) => {
              const handleClick = () => {
                if (item.brand) setSelectedBrand(item.brand)
              }

              return (
                <li key={item.label}>
                  <a href={item.href} onClick={handleClick}>
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

function MenuItemLink({ linkMode, item, onEnter, children }) {
  if (linkMode === 'route') {
    return (
      <Link
        to={getCategoryCollectionPath(item.key)}
        className="menu-item__link"
        title={item.sidebarLabel}
        onMouseEnter={onEnter}
      >
        {children}
      </Link>
    )
  }

  return (
    <a href={item.href} className="menu-item__link" title={item.sidebarLabel} onMouseEnter={onEnter}>
      {children}
    </a>
  )
}

export function CategoryMenu({ remoteProducts = [], categoryItems = [], linkMode = 'anchor' }) {
  const location = useLocation()
  const isHomeRoute = location.pathname === ROUTES.HOME
  const isOpen = useHomeStore((state) => state.isCategoryMenuOpen)

  const categoriesToUse = useMemo(
    () => [
      {
        key: 'featured',
        sidebarLabel: 'Tổng hợp khuyến mãi',
        stripLabel: 'Khuyến mãi',
        icon: Gift,
        href: '#hero',
        tone: ['#6c7dff', '#ff6ea8'],
        showInStrip: false,
      },
      ...categoryItems,
    ],
    [categoryItems],
  )

  const [activeCategory, setActiveCategory] = useState(null)
  const [isMegaOpen, setIsMegaOpen] = useState(false)
  const closeTimerRef = useRef(null)

  const activeGroups = useMemo(() => {
    if (!activeCategory) return []

    return buildCategoryMegaGroups(remoteProducts, activeCategory)
  }, [remoteProducts, activeCategory])

  const hasActiveProducts =
    activeGroups.length > 0 &&
    activeGroups.some((group) => group.items?.some((entry) => entry.label && entry.label !== 'Không có sản phẩm nào'))

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const openMegaPanel = () => {
    clearCloseTimer()
    setIsMegaOpen(true)
  }

  const handleLeaveCategoryMenu = () => {
    clearCloseTimer()
    setIsMegaOpen(false)
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  if (!isHomeRoute && !isOpen) return null

  if (!categoriesToUse.length) {
    return (
      <aside id="category-menu" className="category-menu" aria-label="Danh mục sản phẩm">
        <nav className="h-100">
          <ul className="category-menu__menu navigation list-group list-group-flush scroll">
            <li className="menu-item list-group-item">
              <span className="menu-item__link">Đang tải danh mục...</span>
            </li>
          </ul>
        </nav>
      </aside>
    )
  }

  return (
    <aside
      id="category-menu"
      className="category-menu"
      aria-label="Danh mục sản phẩm"
      onMouseEnter={openMegaPanel}
      onMouseLeave={handleLeaveCategoryMenu}
    >
      <nav className="h-100">
        <ul className="category-menu__menu navigation list-group list-group-flush scroll">
          {categoriesToUse.map((item) => {
            const Icon = item.icon
            const isActive = item.key === activeCategory
            const groups = buildCategoryMegaGroups(remoteProducts, item.key)
            const hasProducts =
              groups.length > 0 &&
              groups.some((group) => group.items?.some((entry) => entry.label && entry.label !== 'Không có sản phẩm nào'))

            const handleEnter = () => {
              setActiveCategory(item.key)
              if (hasProducts) {
                openMegaPanel()
              } else {
                setIsMegaOpen(false)
              }
            }

            return (
              <li key={item.key} className={`menu-item list-group-item ${isActive ? 'is-active' : ''}`}>
                <MenuItemLink linkMode={linkMode} item={item} hasProducts={hasProducts} onEnter={handleEnter}>
                  {Icon ? (
                    <span className="menu-item__icon">
                      <Icon size={18} />
                    </span>
                  ) : (
                    <span className="menu-item__icon" />
                  )}

                  <span className="menu-item__label">{item.sidebarLabel}</span>

                  {hasProducts ? (
                    <i className="menu-item__chevron" aria-hidden="true">
                      <ChevronRight size={14} />
                    </i>
                  ) : (
                    <span />
                  )}
                </MenuItemLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {isMegaOpen && hasActiveProducts ? (
        <div className="category-menu__mega-shell" onMouseEnter={openMegaPanel} onMouseLeave={handleLeaveCategoryMenu}>
          <CategoryMegaPanel categoryKey={activeCategory} remoteProducts={remoteProducts} />
        </div>
      ) : null}
    </aside>
  )
}
