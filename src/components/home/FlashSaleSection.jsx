import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, Search, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../utils/currency'
import { mapProductsToCards } from '../../utils/productMapper'
import { useCartStore } from '../../store/useCartStore'
import { ROUTES } from '../../config/routes'

function buildTimeParts(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds)
  const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(safeSeconds % 60).padStart(2, '0')

  return [
    { value: hours, label: 'Giờ' },
    { value: minutes, label: 'Phút' },
    { value: seconds, label: 'Giây' },
  ]
}

function useFlashCountdown() {
  const [remaining, setRemaining] = useState(() => 9 * 3600 + 20 * 60 + 32)

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 0) {
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [])

  return useMemo(() => buildTimeParts(remaining), [remaining])
}

function FlashSaleCard({ product }) {
  const [isAdding, setIsAdding] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)
  const navigate = useNavigate()
  const detailPath = ROUTES.PRODUCT_DETAIL.replace(':productId', String(product.id))
  const comparePath = `${ROUTES.COMPARE}?ids=${product.id}`

  const handleAction = () => {
    if (product.soldOut) {
      return
    }

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

  const handleCardClick = () => {
    navigate(detailPath)
  }

  const stopCardClick = (event) => {
    event.stopPropagation()
  }

  return (
    <article
      className={`flash-sale-card${product.soldOut ? ' is-sold-out' : ''}`}
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleCardClick()
        }
      }}
    >
      <div className="flash-sale-card__media">
        <span className="flash-sale-card__period">{product.period}</span>

        <div className="flash-sale-card__discount">
          <span>{product.discountLabel ?? 'GIẢM ĐẾN'}</span>
          <strong>50%</strong>
        </div>

        <div className="flash-sale-card__hover-actions" aria-label={`Tác vụ nhanh cho ${product.name}`}>
          <Link
            to={detailPath}
            onClick={stopCardClick}
            className="flash-sale-card__hover-action"
            aria-label={`Xem chi tiết ${product.name}`}
          >
            <Search size={16} />
          </Link>
          <Link
            to={comparePath}
            onClick={stopCardClick}
            className="flash-sale-card__hover-action"
            aria-label={`So sánh ${product.name}`}
          >
            <BarChart3 size={16} />
          </Link>
        </div>

        {product.image ? (
          <img className="flash-sale-card__image" src={product.image} alt={product.name} loading="lazy" />
        ) : (
          <div className={`flash-sale-card__art flash-sale-card__art--${product.type}`}>
            <div className="flash-sale-card__art-core" />
            <div className="flash-sale-card__art-detail" />
            <div className="flash-sale-card__art-shadow" />
          </div>
        )}

        <div className="flash-sale-card__corner-ribbon" aria-hidden="true" />
      </div>

      <h3 className="flash-sale-card__name">
        <Link to={detailPath} onClick={stopCardClick}>
          {product.name}
        </Link>
      </h3>

      <div className="flash-sale-card__price-row">
        <span className="flash-sale-card__price">{formatCurrency(product.price)}</span>

        {product.soldOut ? (
          <button type="button" className="flash-sale-card__sold-out" disabled>
            Hết hàng
          </button>
        ) : (
          <button
            type="button"
            className="flash-sale-card__action"
            onClick={(event) => {
              event.stopPropagation()
              handleAction()
            }}
            disabled={isAdding}
            aria-label={isAdding ? 'Đang thêm vào giỏ' : 'Thêm vào giỏ'}
          >
            <ShoppingCart size={16} />
          </button>
        )}
      </div>

      <div className={`flash-sale-card__status flash-sale-card__status--${product.statusTone ?? 'soft'}`}>
        <span aria-hidden="true">🔥</span>
        <span>{product.label}</span>
      </div>
    </article>
  )
}

export function FlashSaleSection({ products, remoteProducts = [] }) {
  const countdown = useFlashCountdown()
  const formatFlashSaleMeta = (product) => {
    const stock = typeof product.stock === 'number' ? Math.max(0, product.stock) : null
    const soldOut = stock === 0
    const statusTone = soldOut ? 'danger' : stock !== null && stock <= 5 ? 'warning' : 'soft'
    const label =
      stock === null
        ? product.label
        : soldOut
          ? 'Hết hàng'
          : stock <= 5
            ? `Sắp hết hàng, còn ${stock} sản phẩm`
            : `Còn ${stock} sản phẩm`

    return {
      ...product,
      soldOut,
      statusTone,
      label,
    }
  }

  const rules = [
    'Giảm từ 800K',
    'Giảm 8% cho đơn hàng từ 499K',
    'Giảm thêm cho khách mới',
    'Giảm thêm 5% cho đơn từ 1 triệu',
    'Freeship nội thành HCM',
    'Ưu đãi riêng cho thành viên',
  ]

  const displayProducts = useMemo(() => {
    const LOW_PRICE_THRESHOLD = 500000

    const today = new Date()
    const startDate = new Date(today)
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + 14)

    const formatDate = (date) => {
      const day = date.getDate()
      const month = date.getMonth() + 1
      return `${day}/${month}`
    }

    const periodRange = `${formatDate(startDate)} - ${formatDate(endDate)}`

    const remoteFlashProducts = [...remoteProducts]
      .filter(
        (product) =>
          (typeof product.discountPercentage === 'number' && product.discountPercentage > 0) ||
          (typeof product.price === 'number' && product.price < LOW_PRICE_THRESHOLD),
      )
      .sort((left, right) => {
        const leftDiscount = typeof left.discountPercentage === 'number' ? left.discountPercentage : 0
        const rightDiscount = typeof right.discountPercentage === 'number' ? right.discountPercentage : 0

        if (leftDiscount > 0 && rightDiscount === 0) return -1
        if (leftDiscount === 0 && rightDiscount > 0) return 1
        if (leftDiscount > 0 && rightDiscount > 0) return rightDiscount - leftDiscount

        return (left.price || 0) - (right.price || 0)
      })
      .slice(0, 5)

    if (remoteFlashProducts.length > 0) {
      return mapProductsToCards(remoteFlashProducts, {
        type: 'phone',
        label: 'Còn hàng',
      }).map((product) => ({
        ...formatFlashSaleMeta(product),
        period: periodRange,
        discountLabel:
          typeof product.discountPercentage === 'number' && product.discountPercentage > 0
            ? `GIẢM ${product.discountPercentage}%`
            : 'GIÁ TỐT',
      }))
    }

    return mapProductsToCards(Array.isArray(products) ? products.slice(0, 5) : [], {
      type: 'phone',
      label: 'Còn hàng',
    }).map((product) => ({
      ...formatFlashSaleMeta(product),
      period: periodRange,
      discountLabel:
        typeof product.discountPercentage === 'number' && product.discountPercentage > 0
          ? `GIẢM ${product.discountPercentage}%`
          : 'GIÁ TỐT',
    }))
  }, [products, remoteProducts])

  return (
    <section className="section section--flash" id="flash-sale">
      <div className="flash-sale-panel">
        <div className="flash-sale-panel__header">
          <div className="flash-sale-panel__title">
            <h2>GIẢM SỐC 50%</h2>
            <strong>HOT</strong>
          </div>

          <div className="flash-sale-panel__countdown">
            <span>Kết thúc sau</span>
            <div className="flash-sale-panel__clock" aria-label="Đếm ngược khuyến mãi">
              {countdown.map((part) => (
                <div key={part.label} className="flash-sale-panel__clock-box">
                  <strong>{part.value}</strong>
                  <span>{part.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flash-sale-panel__subhead">
          <span>BẢN TIN KHUYẾN MÃI</span>
          <div className="flash-sale-panel__rules-viewport" aria-label="Điều kiện khuyến mãi">
            <div className="flash-sale-panel__rules-track">
              <div className="flash-sale-panel__rules">
                {rules.map((rule) => (
                  <span key={rule} className="flash-sale-panel__rule-item">
                    {rule}
                  </span>
                ))}
              </div>
              <div className="flash-sale-panel__rules" aria-hidden="true">
                {rules.map((rule) => (
                  <span key={`${rule}-clone`} className="flash-sale-panel__rule-item">
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flash-sale-grid">
          {displayProducts.map((product) => (
            <FlashSaleCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
