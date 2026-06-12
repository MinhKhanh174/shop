import { Filter, RotateCcw } from 'lucide-react'

export function CategorySidebar({
  brands = [],
  selectedBrands = [],
  selectedPriceRange = 'all',
  onToggleBrand,
  onPriceRangeChange,
  onReset,
  totalCount = 0,
}) {
  const priceRanges = [
    { value: 'all', label: 'Tất cả mức giá' },
    { value: 'under-2000000', label: 'Dưới 2.000.000đ' },
    { value: '2000000-5000000', label: '2.000.000đ - 5.000.000đ' },
    { value: '5000000-10000000', label: '5.000.000đ - 10.000.000đ' },
    { value: 'over-10000000', label: 'Trên 10.000.000đ' },
  ]

  return (
    <aside className="category-sidebar">
      <div className="category-sidebar__header">
        <div>
          <span className="category-sidebar__eyebrow">
            <Filter size={14} />
            Bộ lọc sản phẩm
          </span>
          <h2>Sản phẩm</h2>
        </div>
        <button type="button" className="category-sidebar__reset" onClick={onReset}>
          <RotateCcw size={14} />
          <span>Xóa lọc</span>
        </button>
      </div>

      <div className="category-sidebar__summary">
        <strong>{totalCount}</strong>
        <span>sản phẩm phù hợp</span>
      </div>

      <div className="category-sidebar__group">
        <h3>Hãng sản xuất</h3>
        <div className="category-sidebar__options">
          {brands.length > 0 ? (
            brands.map((brand) => {
              const checked = selectedBrands.includes(brand)

              return (
                <label key={brand} className="category-sidebar__option">
                  <input type="checkbox" checked={checked} onChange={() => onToggleBrand(brand)} />
                  <span>{brand}</span>
                </label>
              )
            })
          ) : (
            <p className="category-sidebar__empty">Chưa có thương hiệu phù hợp.</p>
          )}
        </div>
      </div>

      <div className="category-sidebar__group">
        <h3>Mức giá</h3>
        <div className="category-sidebar__options">
          {priceRanges.map((range) => (
            <label key={range.value} className="category-sidebar__option">
              <input
                type="radio"
                name="category-price-range"
                checked={selectedPriceRange === range.value}
                onChange={() => onPriceRangeChange(range.value)}
              />
              <span>{range.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
}
