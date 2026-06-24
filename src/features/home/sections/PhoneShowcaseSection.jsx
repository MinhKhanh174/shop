import { useMemo } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useHomeStore } from '../../../store/useHomeStore'
import { ProductCard } from '../../../shared/ui/ProductCard'
import { SectionHeading } from '../../../shared/ui/SectionHeading'
import { filterProductsBySupportedBrand, mapProductsToCards } from '../../../utils/productMapper'
import { getCategoryCollectionPath } from '../../../utils/categoryRoutes'

const phoneBannerCopy = {
  Apple: {
    label: 'IPHONE 13 PRO MAX GIẢM ĐẾN',
    price: '4.900.000Đ',
    note: 'Từ ngày 1/1 - 14/2/2022',
  },
  Samsung: {
    label: 'GALAXY Z FLIP5 5G GIẢM ĐẾN',
    price: '23.990.000Đ',
    note: '0% PREORDER · TRẢ GÓP 0%',
  },
  Oppo: {
    label: 'OPPO FIND X3 PRO 5G GIẢM ĐẾN',
    price: '23.999.000Đ',
    note: 'Tặng gói bảo hành Gold',
  },
  Xiaomi: {
    label: 'XIAOMI 13T GIẢM ĐẾN',
    price: '10.990.000Đ',
    note: 'Ưu đãi theo từng thời điểm',
  },
  realme: {
    label: 'REALME GT NEO 3 GIẢM ĐẾN',
    price: '9.990.000Đ',
    note: 'Tặng quà tặng độc quyền',
  },
  vivo: {
    label: 'VIVO V27 PRO GIẢM ĐẾN',
    price: '12.990.000Đ',
    note: 'Trả góp 0% · Freeship',
  },
}

export function PhoneShowcaseSection({ remoteProducts, bannerAssets = {} }) {
  const selectedBrand = useHomeStore((state) => state.selectedBrand)
  const setSelectedBrand = useHomeStore((state) => state.setSelectedBrand)

  const showcasePhones = useMemo(() => {
    const remotePhones = filterProductsBySupportedBrand(remoteProducts).filter(
      (product) => product.category === 'smartphones',
    )

    const mappedRemotePhones = mapProductsToCards(remotePhones, {
      type: 'phone',
      label: 'Trả góp 0%',
    })

    const brandOrder = ['Apple', 'Samsung', 'Oppo', 'Xiaomi']

    return [...mappedRemotePhones]
      .sort((left, right) => {
        const leftSelected = left.brand === selectedBrand ? -1 : 0
        const rightSelected = right.brand === selectedBrand ? -1 : 0

        if (leftSelected !== rightSelected) {
          return leftSelected - rightSelected
        }

        const leftBrandRank = brandOrder.indexOf(left.brand)
        const rightBrandRank = brandOrder.indexOf(right.brand)
        const normalizedLeftBrandRank = leftBrandRank === -1 ? brandOrder.length : leftBrandRank
        const normalizedRightBrandRank = rightBrandRank === -1 ? brandOrder.length : rightBrandRank

        return normalizedLeftBrandRank - normalizedRightBrandRank
      })
      .slice(0, 8)
  }, [remoteProducts, selectedBrand])

  const brands = useMemo(() => {
    const uniqueBrands = new Set()
    remoteProducts.forEach((product) => {
      if (product.brand && product.category === 'smartphones' && phoneBannerCopy[product.brand]) {
        uniqueBrands.add(product.brand)
      }
    })
    return Array.from(uniqueBrands)
  }, [remoteProducts])

  const heroCopy = phoneBannerCopy[selectedBrand] || phoneBannerCopy.Apple
  const heroImages = Array.isArray(bannerAssets.heroImages) ? bannerAssets.heroImages : []

  const heroPrimaryImage =
    showcasePhones.find((product) => product.brand === selectedBrand && product.image)?.image ??
    heroImages[0] ??
    showcasePhones[0]?.image ??
    null

  const heroSecondaryImage =
    showcasePhones.find((product) => product.brand !== selectedBrand && product.image)?.image ??
    heroImages[1] ??
    showcasePhones[1]?.image ??
    null

  const productsWithImages = remoteProducts.filter((product) => product?.thumbnail || product?.images?.[0])
  const promoProducts = productsWithImages.slice(3, 6)

  const promoTiles = mapProductsToCards(promoProducts, {
    type: 'phone',
    label: 'MUA NGAY',
  }).map((product, index) => ({
    ...product,
    promoTitle: product.name,
    promoDiscount: product.badge ?? product.label ?? '',
    promoCta: 'MUA NGAY',
    promoTone: ['blue', 'cyan', 'navy'][index % 3],
  }))

  return (
    <section className="section" id="phone-section">
      <SectionHeading
        eyebrow="Điện thoại nổi bật nhất"
        title="ĐIỆN THOẠI NỔI BẬT NHẤT"
        action={
          <div className="brand-tabs">
            {brands.map((brand) => (
              <button
                key={brand}
                type="button"
                className={brand === selectedBrand ? 'is-active' : ''}
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
            <h3>DEAL PHÁT SỐT</h3>
            <strong>100% PHẢI CHỐT</strong>

            <div className="phone-showcase__hero-price">
              <span>{heroCopy.label}</span>
              <strong>{heroCopy.price}</strong>
            </div>

            <p>{heroCopy.note}</p>
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

        {showcasePhones.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>

      <div className="center-action">
        <Link to={getCategoryCollectionPath('smartphones')} className="button button--ghost">
          Xem tất cả
          <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="phone-showcase__promo-row">
        {promoTiles.map((tile) => (
          <ProductCard key={tile.id} product={tile} variant="promo" />
        ))}
      </div>
    </section>
  )
}
