/* eslint-disable react-refresh/only-export-components */
import { createContext, useMemo, useState } from 'react'

export const AdminSidebarContext = createContext(null)

export function AdminSidebarProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const value = useMemo(
    () => ({
      isSidebarOpen,
      setIsSidebarOpen,
    }),
    [isSidebarOpen],
  )

  return (
    <AdminSidebarContext.Provider value={value}>
      {children}
    </AdminSidebarContext.Provider>
  )
}
