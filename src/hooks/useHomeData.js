import { useContext } from 'react'
import { HomeDataContext } from '../context/homeDataContext'

export function useHomeData() {
  const context = useContext(HomeDataContext)

  if (!context) {
    throw new Error('useHomeData must be used within HomeDataProvider')
  }

  return context
}
