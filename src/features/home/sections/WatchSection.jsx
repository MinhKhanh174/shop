import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../../../shared/ui/ProductCard'
import { SectionHeading } from '../../../shared/ui/SectionHeading'
import { mapProductsToCards } from '../../../utils/productMapper'
import { getCategoryCollectionPath } from '../../../utils/categoryRoutes'

export function WatchSection({ remoteProducts, watchBannerImage, categoryItems = [] }) {
  const [activeBrand] = useState('Apple')
  const watchStripItems = categoryItems.filter((item) => item.showInStrip)

  const showcaseWatchProducts = useMemo(() => {
    const watchCandidates = remoteProducts
      .filter((product) => product.category === 'mens-watches' || product.category === 'womens-watches')
      .slice(0, 8)

    const mappedRemote = mapProductsToCards(watchCandidates, {
      type: 'watch',
      label: 'Trả góp 0%',
    })

    return [...mappedRemote]
      .sort((left, right) => {
        const leftActive = left.brand === activeBrand ? -1 : 0
        const rightActive = right.brand === activeBrand ? -1 : 0

        return leftActive - rightActive
      })
      .slice(0, 8)
  }, [activeBrand, remoteProducts])

  return (
    <section className="section" id="watch-section">
      <SectionHeading
        eyebrow="Đồng hồ thông minh"
        title="ĐỒNG HỒ THÔNG MINH"
        subcategories={watchStripItems}
      />

      <div className="watch-showcase">
        <div className="watch-showcase__feature">
          <article className="watch-feature-card">
            <div className="watch-feature-card__copy">
              <h3>SMARTWATCH PHỤ KIỆN HI-TECH</h3>
              <span>MUA NGAY</span>
            </div>

            <div className="watch-feature-card__badge">30% OFF</div>

            <div className="watch-feature-card__art" aria-hidden="true">
              {watchBannerImage ? (
                <img className="watch-feature-card__image" src={watchBannerImage} alt="" loading="lazy" />
              ) : (
                <div className="watch-feature-card__device">
                  <div className="watch-feature-card__device-face" />
                  <div className="watch-feature-card__device-strap watch-feature-card__device-strap--left" />
                  <div className="watch-feature-card__device-strap watch-feature-card__device-strap--right" />
                </div>
              )}
            </div>

            <div className="watch-feature-card__glow" aria-hidden="true" />
          </article>
        </div>

        <div className="product-showcase-grid watch-showcase__grid">
          {showcaseWatchProducts.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      </div>

      <div className="watch-bottom-banner">
        <div className="watch-bottom-banner__copy">
          <h3>Cáp sạc nhanh Type C Baseus Mini White</h3>
          <p>Giá cũ 65.000đ</p>
        </div>

        <div className="watch-bottom-banner__price">
          <span>Giá chỉ</span>
          <strong>59.000Đ</strong>
        </div>

        <div className="watch-bottom-banner__art" aria-hidden="true">
          <div className="watch-bottom-banner__cable" />
        </div>
      </div>

      <div className="product-showcase-action">
        <Link to={getCategoryCollectionPath('watch')} className="button button--ghost">
          Xem tất cả
        </Link>
      </div>
    </section>
  )
}
