import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'
import { ROUTES } from '../../constants/routes'
import { clearAuthSession } from '../../utils/authStorage'
import '../admin.css'

export default function AdminLayout() {
  const navigate = useNavigate()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMobileSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileSidebarOpen])

  const handleLogout = () => {
    clearAuthSession()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} onLogout={handleLogout} />

      <div className="min-h-screen lg:pl-[260px]">
        <AdminHeader onToggleSidebar={() => setMobileSidebarOpen((value) => !value)} />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px] space-y-6">
            <Outlet context={{ onLogout: handleLogout }} />
          </div>
        </main>
      </div>
    </div>
  )
}
