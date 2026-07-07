import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { SiteHeader } from '../../components/layout/SiteHeader'
import { SubNav } from '../../components/layout/SubNav'
import { SiteFooter } from './SiteFooter'
import { CompareTray } from '../ui/CompareTray'
import { QuickContactButtons } from '../ui/QuickContactButtons'
import { useScrollShadow } from '../../hooks/useScrollShadow'

export default function StorefrontLayout() {
  const isScrolled = useScrollShadow()
  const headerRef = useRef(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    const headerEl = headerRef.current
    if (!headerEl) return undefined

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

  useLayoutEffect(() => {
    const headerEl = headerRef.current
    if (!headerEl) return

    setHeaderHeight(headerEl.offsetHeight)
  }, [])

  return (
    <div
      className="storefront-layout"
      style={{
        '--site-header-height': `${headerHeight}px`,
      }}
    >
      <div ref={headerRef} className="site-header">
        <SiteHeader isScrolled={isScrolled} />
      </div>

      <div className="site-subnav">
        <SubNav />
      </div>

      <main className="app-shell__content">
        <div className="site-container">
          <Outlet />
        </div>
      </main>

      <QuickContactButtons />
      <CompareTray />
      <SiteFooter />
    </div>
  )
}
