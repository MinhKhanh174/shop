import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useHomeStore } from '../store/useHomeStore'

export function useRouteCategorySync() {
  const location = useLocation()
  const isHomeRoute = location.pathname === '/'
  const openCategoryMenu = useHomeStore((state) => state.openCategoryMenu)
  const closeCategoryMenu = useHomeStore((state) => state.closeCategoryMenu)

  useEffect(() => {
    if (isHomeRoute) {
      openCategoryMenu()
      return
    }

    closeCategoryMenu()
  }, [isHomeRoute, openCategoryMenu, closeCategoryMenu])

  return isHomeRoute
}
