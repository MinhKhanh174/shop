import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

export default function AdminAccessDeniedPage() {
  const location = useLocation()
  const fromPath = typeof location.state?.from === 'string' && location.state.from.trim() ? location.state.from : '/admin'

  return (
    <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 text-amber-950 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Access denied</p>
      <h1 className="mt-3 text-2xl font-semibold">Tài khoản này không có quyền truy cập admin</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-900/80">
        Đây là phân quyền demo phía frontend cho dự án FE-only. Với production, backend cần xác minh role bằng
        session hoặc token trước khi cho phép vào khu vực quản trị.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to={ROUTES.LOGIN}
          state={{ from: fromPath }}
          replace
          className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          Đi tới đăng nhập
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-2xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-100"
        >
          Về trang chủ
        </Link>
      </div>
      <p className="mt-4 text-xs text-amber-900/70">Đường dẫn đã bị chặn: {fromPath}</p>
    </div>
  )
}
