import { SlidersHorizontal } from 'lucide-react'

const sortOptions = [
  { value: 'name-asc', label: 'Tên A→Z' },
  { value: 'name-desc', label: 'Tên Z→A' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'newest', label: 'Hàng mới' },
]

export function CategorySortBar({ sortBy, onSortByChange }) {
  return (
    <div className="category-sort-bar">
      <div className="category-sort-bar__heading">
        <SlidersHorizontal size={16} />
        <span>Sắp xếp:</span>
      </div>

      <div className="category-sort-bar__options" role="tablist" aria-label="Sắp xếp sản phẩm">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`category-sort-bar__option${sortBy === option.value ? ' is-active' : ''}`}
            onClick={() => onSortByChange(option.value)}
            aria-pressed={sortBy === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
