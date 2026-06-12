import { useMemo, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../../../shared/ui/ProductCard'
import { SectionHeading } from '../../../shared/ui/SectionHeading'
import { mapProductsToCards } from '../../../utils/productMapper'
import { getCategoryCollectionPath } from '../../../utils/categoryRoutes'

function formatCurrency(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return ''
  }

  return new Intl.NumberFormat('vi-VN').format(Math.round(value))
}

function buildBrandOptions(products) {
  const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))]

  return brands.length > 0 ? brands : ['Tất cả']
}

export function CategoryShowcaseSection({ sectionId, categoryKey, categoryLabel, remoteProducts = [] }) {
  const [selectedBrand, setSelectedBrand] = useState(null)

  const categoryProducts = useMemo(
    () => remoteProducts.filter((product) => product.category === categoryKey),
    [remoteProducts, categoryKey],
  )

  const brands = useMemo(() => buildBrandOptions(categoryProducts), [categoryProducts])

  const activeBrand = selectedBrand ?? brands[0] ?? 'Tất cả'

  const showcaseProducts = useMemo(() => {
    const filtered =
      activeBrand === 'Tất cả' ? categoryProducts : categoryProducts.filter((product) => product.brand === activeBrand)

    const mappedProducts = mapProductsToCards(filtered, {
      label: 'Trả góp 0%',
    })

    return [...mappedProducts]
      .sort((left, right) => {
        const leftSelected = left.brand === activeBrand ? -1 : 0
        const rightSelected = right.brand === activeBrand ? -1 : 0

        return leftSelected - rightSelected
      })
      .slice(0, 8)
  }, [activeBrand, categoryProducts])

  const heroPrimaryImage =
    showcaseProducts.find((product) => product.brand === activeBrand && product.image)?.image ??
    showcaseProducts[0]?.image ??
    null

  const heroSecondaryImage =
    showcaseProducts.find((product) => product.brand !== activeBrand && product.image)?.image ??
    showcaseProducts[1]?.image ??
    null

  const heroPrice = showcaseProducts[0]?.price ? `${formatCurrency(showcaseProducts[0].price)}Đ` : 'XEM NGAY'
  const heroNote = `${categoryProducts.length} sản phẩm đang hiển thị`

  const promoTiles = showcaseProducts.slice(0, 3).map((product, index) => ({
    title: product.name,
    discount: product.badge || product.label || '',
    cta: 'MUA NGAY',
    tone: ['blue', 'cyan', 'navy'][index % 3],
    image: product.image || null,
  }))

  if (!categoryProducts.length) {
    return null
  }

  return (
    <section className="section" id={sectionId || `category-${categoryKey}`}>
      <SectionHeading
        eyebrow={categoryLabel}
        title={categoryLabel.toUpperCase()}
        action={
          <div className="brand-tabs">
            {brands.map((brand) => (
              <button
                key={brand}
                type="button"
                className={brand === activeBrand ? 'is-active' : ''}
                onClick={() => setSelectedBrand(brand)}
              >
                {brand}
              </button>
            ))}
          </div>
        }
      />

      <div className="phone-showcase__grid">
        <article className="phone-showcase__hero">
          <div className="phone-showcase__hero-copy">
            <span className="phone-showcase__hero-brand">techstore.com</span>
            <h3>DEAL NỔI BẬT</h3>
            <strong>{categoryLabel.toUpperCase()}</strong>

            <div className="phone-showcase__hero-price">
              <span>{activeBrand}</span>
              <strong>{heroPrice}</strong>
            </div>

            <p>{heroNote}</p>
          </div>

          <div className="phone-showcase__hero-art" aria-hidden="true">
            <div className="phone-showcase__hero-orbit" />
            {heroPrimaryImage ? (
              <img
                className="phone-showcase__hero-image phone-showcase__hero-image--primary"
                src={heroPrimaryImage}
                alt=""
                loading="lazy"
              />
            ) : (
              <div className="phone-showcase__hero-device phone-showcase__hero-device--primary" />
            )}

            {heroSecondaryImage ? (
              <img
                className="phone-showcase__hero-image phone-showcase__hero-image--secondary"
                src={heroSecondaryImage}
                alt=""
                loading="lazy"
              />
            ) : (
              <div className="phone-showcase__hero-device phone-showcase__hero-device--secondary" />
            )}

            <div className="phone-showcase__hero-badge">Trả góp 0%</div>
          </div>
        </article>

        {showcaseProducts.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>

      <div className="center-action">
        <Link to={getCategoryCollectionPath(categoryKey)} className="button button--ghost">
          Xem tất cả
          <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="phone-showcase__promo-row" style={{ '--promo-columns': promoTiles.length || 1 }}>
        {promoTiles.map((tile) => (
          <article key={tile.title} className={`phone-showcase__promo phone-showcase__promo--${tile.tone}`}>
            <div className="phone-showcase__promo-copy">
              <h4>{tile.title}</h4>
              <strong>{tile.discount}</strong>
              <span>{tile.cta}</span>
            </div>

            {tile.image ? (
              <img className="phone-showcase__promo-image" src={tile.image} alt={tile.title} loading="lazy" />
            ) : (
              <div className="phone-showcase__promo-placeholder" />
            )}

            <div className="phone-showcase__promo-glow" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  )
}
