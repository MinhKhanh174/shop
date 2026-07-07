/* eslint-disable react-refresh/only-export-components */
import { createContext, useMemo, useState } from 'react'

export const AdminThemeContext = createContext(null)

export function AdminThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  const value = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme],
  )

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  )
}
