import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useHomeStore } from '../store/useHomeStore'

export function useRouteCategorySync() {
  const location = useLocation()
  const isHomeRoute = location.pathname === ROUTES.HOME
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
