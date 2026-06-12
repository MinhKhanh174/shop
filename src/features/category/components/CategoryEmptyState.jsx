import { PackageSearch } from 'lucide-react'

export function CategoryEmptyState({ title, description, onReset }) {
  return (
    <div className="category-empty-state">
      <div className="category-empty-state__icon" aria-hidden="true">
        <PackageSearch size={30} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {onReset ? (
        <button type="button" className="button button--ghost" onClick={onReset}>
          Xóa bộ lọc
        </button>
      ) : null}
    </div>
  )
}
