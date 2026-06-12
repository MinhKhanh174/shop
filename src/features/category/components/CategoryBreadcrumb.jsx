import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function CategoryBreadcrumb({ label }) {
  return (
    <nav className="category-breadcrumb" aria-label="Breadcrumb">
      <Link to="/" className="category-breadcrumb__link">
        Trang chủ
      </Link>
      <ChevronRight size={14} aria-hidden="true" />
      <span className="category-breadcrumb__current">{label}</span>
    </nav>
  )
}
