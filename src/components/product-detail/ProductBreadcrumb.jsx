import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ProductBreadcrumb({ items = [] }) {
  if (!items.length) {
    return null
  }

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.to && !isLast ? (
              <Link to={item.to} className="transition hover:text-red-600">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-semibold text-slate-900' : ''}>{item.label}</span>
            )}
            {!isLast ? <ChevronRight size={14} aria-hidden="true" /> : null}
          </span>
        )
      })}
    </nav>
  )
}
