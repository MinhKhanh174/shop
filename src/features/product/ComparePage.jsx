import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { ROUTES } from '../../config/routes'
import { SectionHeading } from '../../shared/ui/SectionHeading.jsx'
import { MAX_COMPARE_ITEMS, useCompareStore } from '../../store/useCompareStore'
import { extractColorOptions, extractStorageOptions } from './productDetail.utils'

function normalizeText(value, fallback = '—') {
  const text = String(value ?? '').trim()
  return text || fallback
}

function CompareEmptyState() {
  return (
    <div className="space-y-8">
      <SectionHeading title="So sánh sản phẩm" description="Không có sản phẩm để so sánh" />
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
        Chưa có sản phẩm.
      </div>
    </div>
  )
}

function getVariantLines(product) {
  const colorOptions = extractColorOptions(product).map((item) => item.label).filter(Boolean)
  const storageOptions = extractStorageOptions(product).filter(Boolean)
  const lines = []

  if (colorOptions.length && storageOptions.length) {
    colorOptions.slice(0, 10).forEach((color) => {
      storageOptions.slice(0, 10).forEach((storage) => {
        lines.push(`${color} / ${storage}`)
      })
    })
  } else {
    lines.push(...colorOptions.slice(0, 6))
    lines.push(...storageOptions.slice(0, 6))
  }

  return Array.from(new Set(lines)).slice(0, 12)
}

function CompareContent({ compareItems }) {
  const removeFromCompare = useCompareStore((state) => state.removeFromCompare)
  const visibleProducts = useMemo(() => compareItems.slice(0, MAX_COMPARE_ITEMS), [compareItems])
  const columnCount = Math.max(1, visibleProducts.length)

  const topGridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
    }),
    [columnCount],
  )

  const bodyGridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
    }),
    [columnCount],
  )

  const specGridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
    }),
    [columnCount],
  )

  const descGridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
    }),
    [columnCount],
  )

  const hasAnyProduct = visibleProducts.length > 0

  if (!hasAnyProduct) {
    return <CompareEmptyState />
  }

  return (
    <div className="compare-page space-y-4">
      <SectionHeading title="So sánh sản phẩm" description={`So sánh tối đa ${MAX_COMPARE_ITEMS} sản phẩm cùng lúc`} />

      <nav className="compare-page__breadcrumb" aria-label="Breadcrumb">
        <Link to={ROUTES.HOME} className="compare-page__breadcrumb-link">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="compare-page__breadcrumb-current">So sánh sản phẩm</span>
      </nav>

      <div className="compare-page__panel">
        <div className="compare-page__top-grid" style={topGridStyle}>
          {visibleProducts.map((product) => (
            <article key={product.id} className="compare-page__product-card">
              <button
                type="button"
                className="compare-page__remove"
                onClick={() => removeFromCompare(product.id)}
                aria-label={`Xóa ${product.name} khỏi so sánh`}
              >
                <X size={14} />
              </button>
              <div className="compare-page__image-wrap">
                {product.image ? <img src={product.image} alt={product.name} /> : <div>Không có hình ảnh</div>}
              </div>
              <h3 className="compare-page__name">{product.name}</h3>
              <div className="compare-page__price">
                <strong>{normalizeText(product.priceText)}</strong>
                {product.oldPriceText ? <span>{product.oldPriceText}</span> : null}
              </div>
            </article>
          ))}
        </div>

        <div className="compare-page__section-title">Loại sản phẩm</div>
        <div className="compare-page__row" style={bodyGridStyle}>
          {visibleProducts.map((product) => (
            <div key={`type-${product.id}`} className="compare-page__cell">
              <ul className="compare-page__bullets">
                <li>Loại sản phẩm {normalizeText(product?.category || product?.source?.category || 'Điện thoại')}</li>
                <li>Nhà cung cấp {normalizeText(product?.brand || product?.source?.brand)}</li>
              </ul>
            </div>
          ))}
        </div>

        <div className="compare-page__section-title">Biến thể</div>
        <div className="compare-page__row compare-page__row--variants" style={bodyGridStyle}>
          {visibleProducts.map((product) => (
            <div key={`variants-${product.id}`} className="compare-page__cell compare-page__cell--variants">
              <ul className="compare-page__bullets">
                {getVariantLines(product).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="compare-page__section-title">Thông số kỹ thuật</div>
        <div className="compare-page__spec-grid" style={specGridStyle}>
          {visibleProducts.map((product) => (
            <div key={`spec-${product.id}`} className="compare-page__spec-column">
              <table className="compare-page__mini-table">
                <tbody>
                  {Object.entries(product.specs ?? {}).map(([label, value]) => (
                    <tr key={label}>
                      <th>{label}</th>
                      <td>{normalizeText(value)}</td>
                    </tr>
                  ))}
                  {!Object.keys(product.specs ?? {}).length ? (
                    <>
                      <tr>
                        <th>Thương hiệu</th>
                        <td>{normalizeText(product.brand || product.source?.brand)}</td>
                      </tr>
                      <tr>
                        <th>Danh mục</th>
                        <td>{normalizeText(product.category || product.source?.category)}</td>
                      </tr>
                      <tr>
                        <th>Mã sản phẩm</th>
                        <td>{normalizeText(product.id)}</td>
                      </tr>
                    </>
                  ) : null}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="compare-page__section-title">Miêu tả</div>
        <div className="compare-page__description-grid" style={descGridStyle}>
          {visibleProducts.map((product) => (
            <div key={`desc-${product.id}`} className="compare-page__description-cell">
              <h4 className="compare-page__description-title">{normalizeText(product.name)}</h4>
              <p className="compare-page__description-text">
                {normalizeText(product.description || product.source?.description || 'Chưa có miêu tả cho sản phẩm này.')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ComparePage() {
  const compareItems = useCompareStore((state) => state.compareItems)

  if (!compareItems.length) {
    return <CompareEmptyState />
  }

  return <CompareContent compareItems={compareItems} />
}
