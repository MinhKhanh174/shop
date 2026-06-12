import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 py-16 sm:px-6">
      <div className="max-w-xl rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.32em] text-red-600">404</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Trang không tìm thấy</h1>
        <p className="mt-3 text-slate-500">Trang bạn đang truy cập không tồn tại hoặc đã bị di chuyển.</p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  )
}
