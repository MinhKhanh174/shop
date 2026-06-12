import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../utils/currency'
import { useCartStore } from '../../store/useCartStore'
import { ROUTES } from '../../config/routes'

export function ProductCard({ product, compact = false }) {
  const [isAdding, setIsAdding] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)

  const handleAddToCart = () => {
    setIsAdding(true)

    try {
      addToCart(product)
      toast.success(`Đã thêm ${product.name} vào giỏ`)
    } catch {
      toast.error('Không thể thêm vào giỏ. Vui lòng thử lại.')
    } finally {
      setIsAdding(false)
    }
  }

  const detailPath = ROUTES.PRODUCT_DETAIL.replace(':productId', String(product.id))
  const comparePath = `${ROUTES.COMPARE}?ids=${product.id}`

  return (
    <article className={`product-card ${compact ? 'product-card--compact' : ''}`}>
      <div className="product-card__media">
        <div className={`product-card__art product-card__art--${product.type}`} style={{ background: '#fff' }}>
          {product.badge ? <span className="product-card__badge">{product.badge}</span> : null}

          <div className="product-card__hover-actions" aria-label={`Tác vụ nhanh cho ${product.name}`}>
            <Link to={detailPath} className="product-card__hover-action" aria-label={`Xem chi tiết ${product.name}`}>
              <Search size={16} />
            </Link>
            <Link to={comparePath} className="product-card__hover-action" aria-label={`So sánh ${product.name}`}>
              <BarChart3 size={16} />
            </Link>
          </div>

          {product.image ? (
            <div className="product-card__image-wrap">
              <img className="product-card__image" src={product.image} alt={product.name} loading="lazy" />
            </div>
          ) : (
            <div className="product-card__device">
              <div className="product-card__glow" />
              <div className="product-card__screen" />
              <div className="product-card__home-indicator" />
            </div>
          )}
        </div>
      </div>

      <div className="product-card__body">
        <h3>
          <Link to={detailPath} className="product-card__title-link">
            {product.name}
          </Link>
        </h3>

        <div className="product-card__price-row">
          <span className="product-card__price">{formatCurrency(product.price)}</span>
          <button
            type="button"
            className="product-card__cta"
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label={isAdding ? 'Đang thêm vào giỏ' : 'Thêm vào giỏ'}
          >
            <Plus size={16} />
            <span className="sr-only">{isAdding ? 'Đang thêm...' : 'Thêm vào giỏ'}</span>
          </button>
        </div>

        {product.perk ?? product.label ? <p className="product-card__perk">{product.perk ?? product.label}</p> : null}
      </div>
    </article>
  )
}
