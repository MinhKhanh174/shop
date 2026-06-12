import { useCallback, useMemo, useState } from 'react'
import { useHomeContent } from '../hooks/useHomeContent'
import { mapApiCategoriesToCategoryItems } from '../utils/categoryMapper'
import { HomeDataContext } from './homeDataContext'

export function HomeDataProvider({ children }) {
  const [refreshToken, setRefreshToken] = useState(0)
  const remote = useHomeContent(refreshToken)
  const refetchHomeData = useCallback(() => {
    setRefreshToken((current) => current + 1)
  }, [])

  const categoryItems = useMemo(
    () => mapApiCategoriesToCategoryItems(remote.categories),
    [remote.categories],
  )

  const value = useMemo(
    () => ({
      ...remote,
      categoryItems,
      refetchHomeData,
    }),
    [remote, categoryItems, refetchHomeData],
  )

  return <HomeDataContext.Provider value={value}>{children}</HomeDataContext.Provider>
}
