import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminBreadcrumb({ items = [] }) {
  if (!items.length) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900"
      >
        <Home size={14} />
        Quản trị
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            <ChevronRight size={14} className="text-slate-300" />
            {isLast || !item.to ? (
              <span className="font-medium text-slate-900">{item.label}</span>
            ) : (
              <Link to={item.to} className="font-medium transition-colors hover:text-slate-900">
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
