import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, RefreshCcw, Search } from 'lucide-react'

import AdminBadge from '../components/ui/AdminBadge'
import AdminButton from '../components/ui/AdminButton'
import AdminTable from '../components/ui/AdminTable'
import { getUsers } from '../services/adminUserService'
import { formatAdminRoleLabel, formatAdminStatus } from '../utils/adminDisplayMapper'

const cardBase = 'rounded-[28px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]'

function normalizeValue(value) {
  const text = String(value ?? '').trim()
  return text || '—'
}

function roleLabel(role) {
  return formatAdminRoleLabel(role)
}

function roleTone(role) {
  return String(role ?? '').toLowerCase() === 'admin' ? 'indigo' : 'neutral'
}

function statusLabel(status) {
  return formatAdminStatus(status, 'Ngừng hoạt động')
}

function statusTone(status) {
  return String(status ?? '').toLowerCase() === 'active' ? 'success' : 'warning'
}

function formatDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function isMockFallback(users) {
  return Array.isArray(users) && users.length > 0 && users.every((user) => String(user?.id ?? '').toLowerCase().startsWith('usr-'))
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className={`${cardBase} p-5`}>
        <div className="h-8 w-48 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded-full bg-slate-100" />
      </div>

      <div className={`${cardBase} overflow-hidden`}>
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
          <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="space-y-3 p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  )
}
function EmptyState({ onRetry }) {
  return (
    <div className={`${cardBase} px-6 py-16 text-center`}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Search size={22} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950">Chưa có dữ liệu khách hàng</h3>
      <p className="mt-2 text-sm text-slate-500">Hệ thống chưa nhận được danh sách người dùng từ API demo.</p>
      <div className="mt-6 flex justify-center">
        <AdminButton variant="secondary" onClick={onRetry}>
          <RefreshCcw size={14} />
          Táº£i láº¡i
        </AdminButton>
      </div>
    </div>
  )
}

function NoResultsState({ onReset }) {
  return (
    <div className={`${cardBase} px-6 py-16 text-center`}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Search size={22} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950">Không tìm thấy người dùng phù hợp</h3>
      <p className="mt-2 text-sm text-slate-500">Hãy thử đổi từ khóa tìm kiếm để xem danh sách khác.</p>
      <div className="mt-6 flex justify-center">
        <AdminButton variant="secondary" onClick={onReset}>
          XĂ³a bá»™ lá»c
        </AdminButton>
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className={`${cardBase} border-rose-200 bg-rose-50 px-6 py-16 text-center`}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
        <AlertTriangle size={22} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-rose-950">Không tải được danh sách người dùng</h3>
      <p className="mt-2 text-sm text-rose-700">{message}</p>
      <div className="mt-6 flex justify-center">
        <AdminButton onClick={onRetry}>
          <RefreshCcw size={14} />
          Thá»­ láº¡i
        </AdminButton>
      </div>
    </div>
  )
}

function WarningBanner({ title, children }) {
  return (
    <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="space-y-1 text-sm leading-6">
          <p className="font-semibold">{title}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [retryTick, setRetryTick] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true

    void getUsers()
      .then((data) => {
        if (!active) {
          return
        }

        setUsers(Array.isArray(data) ? data : [])
        setStatus(Array.isArray(data) && data.length ? 'success' : 'empty')
      })
      .catch((error) => {
        if (!active) {
          return
        }

        setUsers([])
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Không tải được dữ liệu người dùng.')
      })

    return () => {
      active = false
    }
  }, [retryTick])

  const handleRetry = () => {
    setUsers([])
    setErrorMessage('')
    setStatus('loading')
    setRetryTick((current) => current + 1)
  }

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return users
    }

    return users.filter((user) => {
      return [user.name, user.email, user.phone, user.role, user.status].some((value) =>
        String(value ?? '').toLowerCase().includes(normalizedSearch),
      )
    })
  }, [search, users])

  const summary = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((user) => String(user.role ?? '').toLowerCase() === 'admin').length,
      active: users.filter((user) => String(user.status ?? '').toLowerCase() === 'active').length,
    }
  }, [users])

  if (status === 'loading') {
    return <LoadingState />
  }

  if (status === 'error') {
    return <ErrorState message={errorMessage || 'Không tải được dữ liệu người dùng từ API demo.'} onRetry={handleRetry} />
  }

  if (status === 'empty' && !users.length) {
    return <EmptyState onRetry={handleRetry} />
  }

  const shouldShowFallbackWarning = isMockFallback(users)

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Quản lý cửa hàng</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Quản lý khách hàng</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Danh sách người dùng được lấy từ service admin và hiển thị theo dữ liệu API demo hoặc dữ liệu dự phòng.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <AdminBadge tone="info">{summary.total.toLocaleString('vi-VN')} người dùng</AdminBadge>
          <AdminBadge tone="success">{summary.active.toLocaleString('vi-VN')} đang hoạt động</AdminBadge>
          <AdminBadge tone="indigo">{summary.admins.toLocaleString('vi-VN')} quản trị viên</AdminBadge>
        </div>
      </div>

      {shouldShowFallbackWarning ? (
        <WarningBanner title="Đang hiển thị dữ liệu dự phòng cho người dùng">
          <p>Service adminUserService không lấy được dữ liệu API demo, nên trang này đang hiển thị dữ liệu giả lập.</p>
        </WarningBanner>
      ) : null}

      <div className={`${cardBase} space-y-4 p-5`}>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm kiếm tên, email, số điện thoại, vai trò..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      {filteredUsers.length ? (
        <AdminTable>
          <thead className="bg-slate-50/90">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <th className="px-5 py-4">Tên</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Vai trò</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4">Số điện thoại</th>
              <th className="px-5 py-4">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="text-sm text-slate-700 transition-colors hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                      {normalizeValue(user.name)
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join('')}
                    </div>
                    <div>
                      <p className="font-medium text-slate-950">{normalizeValue(user.name)}</p>
                      <p className="mt-1 text-xs text-slate-500">ID: {normalizeValue(user.id)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">{normalizeValue(user.email)}</td>
                <td className="px-5 py-4">
                  <AdminBadge tone={roleTone(user.role)}>{roleLabel(user.role)}</AdminBadge>
                </td>
                <td className="px-5 py-4">
                  <AdminBadge tone={statusTone(user.status)}>{statusLabel(user.status)}</AdminBadge>
                </td>
                <td className="px-5 py-4">{normalizeValue(user.phone)}</td>
                <td className="px-5 py-4 text-slate-600">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : users.length ? (
        <NoResultsState onReset={() => setSearch('')} />
      ) : (
        <EmptyState onRetry={handleRetry} />
      )}
    </section>
  )
}
