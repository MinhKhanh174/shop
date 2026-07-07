import { useEffect, useRef, useState } from 'react'
import { LogOut, ShieldCheck } from 'lucide-react'

import { buildDisplayName } from '../../utils/authStorage'

function getInitials(displayName) {
  return displayName
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function roleLabel(role) {
  return role === 'admin' ? 'Quản trị viên' : 'Khách hàng'
}

export default function AdminUserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const [avatarBroken, setAvatarBroken] = useState(false)
  const menuRef = useRef(null)

  const displayName = buildDisplayName(user) || 'Tài khoản quản trị'
  const email = user?.email ?? 'Tài khoản quản trị'
  const role = String(user?.role ?? 'admin')
  const avatarSrc = user?.avatar || user?.image || ''
  const initials = getInitials(displayName) || 'AT'
  const showAvatarImage = Boolean(avatarSrc) && !avatarBroken

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-3 rounded-none border-0 bg-transparent px-0 py-0 text-left shadow-none transition-opacity hover:opacity-90"
      >
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {showAvatarImage ? (
            <img
              src={avatarSrc}
              alt={displayName}
              className="h-full w-full object-cover"
              onError={() => {
                setAvatarBroken(true)
              }}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="hidden min-w-0 leading-tight md:block">
          <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="truncate text-xs text-slate-500">{email}</p>
        </div>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[292px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-100 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                {showAvatarImage ? (
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    className="h-full w-full object-cover"
                    onError={() => {
                      setAvatarBroken(true)
                    }}
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{displayName}</p>
                <p className="truncate text-sm text-slate-500">{email}</p>
              </div>
            </div>
          </div>

          <div className="px-3 py-3">
            <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <ShieldCheck size={16} className="text-blue-600" />
                {roleLabel(role)}
              </div>
              <p className="mt-1 text-xs text-slate-500">Tài khoản quản trị đang đăng nhập</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onLogout?.()
              }}
              className="mt-3 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
