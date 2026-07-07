import { Bell, Menu, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import AdminUserMenu from './AdminUserMenu'
import { ROUTES } from '../../constants/routes'
import { clearAuthSession, getAuthUser } from '../../utils/authStorage'

export default function AdminHeader({ onToggleSidebar }) {
  const navigate = useNavigate()
  const user = getAuthUser()

  const handleLogout = () => {
    clearAuthSession()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 lg:hidden"
          aria-label="Mở hoặc đóng menu quản trị"
        >
          <Menu size={18} />
        </button>

        <form className="hidden flex-1 lg:block">
          <label className="relative block max-w-[420px]">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Tìm kiếm..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-transparent bg-transparent text-slate-600 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm hover:shadow-slate-200/70 hover:-translate-y-0.5"
            aria-label="Thông báo"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          <AdminUserMenu user={user} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  )
}
