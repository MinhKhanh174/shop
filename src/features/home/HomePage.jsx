import { lazy, Suspense, useMemo } from 'react'
import { useHomeData } from '../../hooks/useHomeData'
import { buildBannerAssets } from '../../utils/bannerSelectors'
import { fallbackHeroSlides } from './home.constants'

import { HeroSection } from './sections/HeroSection'
import { ShortcutSection } from './sections/ShortcutSection'
import { BlogSection } from './sections/BlogSection'
import { VoucherSection } from './sections/VoucherSection'

const CategoryShowcaseSection = lazy(() =>
  import('./sections/CategoryShowcaseSection').then((module) => ({ default: module.CategoryShowcaseSection })),
)
const BrandSection = lazy(() =>
  import('./sections/BrandSection').then((module) => ({ default: module.BrandSection })),
)
const FlashSaleSection = lazy(() =>
  import('../../components/home/FlashSaleSection').then((module) => ({ default: module.FlashSaleSection })),
)

function SectionFallback({ minHeight = 220 }) {
  return <div className="section" style={{ minHeight }} aria-hidden="true" />
}

export default function HomePage() {
  const remote = useHomeData()

  const bannerAssets = useMemo(() => buildBannerAssets(remote.products), [remote.products])
  const heroSlides = useMemo(() => fallbackHeroSlides, [])
  const categoryShowcaseItems = useMemo(() => {
    return remote.categoryItems.map((item) => ({
      ...item,
      sectionId: item.key === 'smartphones' ? 'phone-section' : `category-${item.key}`,
    }))
  }, [remote.categoryItems])

  if (remote.loading) {
    return <div className="home-page">Đang tải dữ liệu...</div>
  }

  if (remote.error) {
    return (
      <div className="home-error">
        <h2>Không thể tải dữ liệu trang chủ</h2>
        <p>Vui lòng kiểm tra kết nối mạng và thử tải lại trang.</p>
        <button type="button" className="home-error__btn" onClick={remote.refetchHomeData}>
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <div className="home-page">
      <HeroSection
        heroSlides={heroSlides}
        remoteProducts={remote.products}
        categoryItems={remote.categoryItems}
        bannerAssets={bannerAssets}
      />

      <ShortcutSection categoryItems={remote.categoryItems} />

      <VoucherSection />

      <Suspense fallback={<SectionFallback minHeight={420} />}>
        <FlashSaleSection products={remote.products} remoteProducts={remote.products} />
      </Suspense>

      {categoryShowcaseItems.map((item) => (
        <Suspense key={item.key} fallback={<SectionFallback minHeight={420} />}>
          <CategoryShowcaseSection
            sectionId={item.sectionId}
            categoryKey={item.key}
            categoryLabel={item.sidebarLabel}
            remoteProducts={remote.products}
          />
        </Suspense>
      ))}

      <Suspense fallback={<SectionFallback minHeight={180} />}>
        <BrandSection />
      </Suspense>

      <BlogSection />
    </div>
  )
}
