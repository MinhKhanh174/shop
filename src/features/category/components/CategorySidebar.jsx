import { useState } from 'react'
import { ChevronDown, Filter, RotateCcw } from 'lucide-react'

export function CategorySidebar({
  brands = [],
  selectedBrands = [],
  colors = [],
  selectedColors = [],
  selectedPriceRange = 'all',
  productTypes = [],
  selectedProductTypes = [],
  onToggleBrand,
  onToggleColor,
  onToggleProductType,
  onPriceRangeChange,
  onReset,
  totalCount = 0,
}) {
  const [isBrandsExpanded, setIsBrandsExpanded] = useState(false)
  const [isColorsExpanded, setIsColorsExpanded] = useState(false)

  const priceRanges = [
    { value: 'all', label: 'Tất cả mức giá' },
    { value: 'under-2000000', label: 'Giá dưới 1.000.000đ' },
    { value: '1000000-2000000', label: '1.000.000đ - 2.000.000đ' },
    { value: '2000000-3000000', label: '2.000.000đ - 3.000.000đ' },
    { value: '3000000-5000000', label: '3.000.000đ - 5.000.000đ' },
    { value: '5000000-7000000', label: '5.000.000đ - 7.000.000đ' },
    { value: '7000000-10000000', label: '7.000.000đ - 10.000.000đ' },
    { value: 'over-10000000', label: 'Giá trên 10.000.000đ' },
  ]

  const brandPreviewCount = 4
  const colorPreviewCount = 5
  const visibleBrands = isBrandsExpanded ? brands : brands.slice(0, brandPreviewCount)
  const visibleColors = isColorsExpanded ? colors : colors.slice(0, colorPreviewCount)

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

      {brands.length > 0 ? (
        <div className="category-sidebar__group">
          <h3>Hãng sản xuất</h3>
          <div className="category-sidebar__options">
            {visibleBrands.map((brand) => {
              const checked = selectedBrands.includes(brand)

              return (
                <label key={brand} className="category-sidebar__option">
                  <input type="checkbox" checked={checked} onChange={() => onToggleBrand(brand)} />
                  <span>{brand}</span>
                </label>
              )
            })}
          </div>
          {brands.length > brandPreviewCount ? (
            <button type="button" className="category-sidebar__more" onClick={() => setIsBrandsExpanded((current) => !current)}>
              <span>{isBrandsExpanded ? 'Thu gọn' : 'Xem thêm'}</span>
              <ChevronDown size={14} className={`category-sidebar__more-icon${isBrandsExpanded ? ' is-expanded' : ''}`} />
            </button>
          ) : null}
        </div>
      ) : null}

      {colors.length > 0 ? (
        <div className="category-sidebar__group">
          <h3>Màu sắc</h3>
          <div className="category-sidebar__options category-sidebar__options--color">
            {visibleColors.map((color) => {
              const checked = selectedColors.includes(color.value)

              return (
                <label key={color.value} className="category-sidebar__option category-sidebar__option--color">
                  <input type="checkbox" checked={checked} onChange={() => onToggleColor(color.value)} />
                  <span className="category-sidebar__swatch" style={{ backgroundColor: color.swatch, borderColor: color.border }} />
                  <span>{color.label}</span>
                </label>
              )
            })}
          </div>
          {colors.length > colorPreviewCount ? (
            <button type="button" className="category-sidebar__more" onClick={() => setIsColorsExpanded((current) => !current)}>
              <span>{isColorsExpanded ? 'Thu gọn' : 'Xem thêm'}</span>
              <ChevronDown size={14} className={`category-sidebar__more-icon${isColorsExpanded ? ' is-expanded' : ''}`} />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="category-sidebar__group">
        <h3>Giá</h3>
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

      {productTypes.length > 0 ? (
        <div className="category-sidebar__group">
          <h3>Loại sản phẩm</h3>
          <div className="category-sidebar__options">
            {productTypes.map((type) => {
              const checked = selectedProductTypes.includes(type.value)

              return (
                <label key={type.value} className="category-sidebar__option">
                  <input type="checkbox" checked={checked} onChange={() => onToggleProductType(type.value)} />
                  <span>{type.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      ) : null}
    </aside>
  )
}
