import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { CategoryMenu } from '../../../components/layout/CategoryMenu'

function themeGradient(theme) {
  switch (theme) {
    case 'blue':
      return 'linear-gradient(135deg, #1b1034 0%, #22113f 46%, #6b2ae6 100%)'
    case 'green':
      return 'linear-gradient(135deg, #142423 0%, #141b36 50%, #1a8d78 100%)'
    default:
      return 'linear-gradient(135deg, #160e28 0%, #211135 48%, #7b3aed 100%)'
  }
}

function getImageFromAssets(list, index) {
  return Array.isArray(list) ? list[index] ?? null : null
}

export function HeroSection({ heroSlides, remoteProducts, categoryItems = [], bannerAssets = {} }) {
  const heroImages = Array.isArray(bannerAssets.heroImages) ? bannerAssets.heroImages : []
  const wideImages = Array.isArray(bannerAssets.wideImages) ? bannerAssets.wideImages : []
  const watchImage = bannerAssets.watchImage ?? null

  const promoTiles = [
    {
      title: 'SMARTWATCH',
      subtitle: 'Giảm đến',
      discount: '29%',
      image: watchImage || getImageFromAssets(heroImages, 0),
      className: 'mini-promo--purple',
    },
    {
      title: 'ỐP LƯNG',
      subtitle: 'Giảm đến',
      discount: '40%',
      image: getImageFromAssets(wideImages, 0) || getImageFromAssets(heroImages, 1),
      className: 'mini-promo--blue',
    },
    {
      title: 'SẠC DỰ PHÒNG',
      subtitle: 'Giảm đến',
      discount: '40%',
      image: getImageFromAssets(wideImages, 1) || getImageFromAssets(heroImages, 2),
      className: 'mini-promo--orange',
    },
  ]

  return (
    <section className="home-hero" id="hero">
      <CategoryMenu remoteProducts={remoteProducts} categoryItems={categoryItems} />

      <div className="hero__main">
        <div className="hero__slider">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={{
              prevEl: '.hero__arrow--left',
              nextEl: '.hero__arrow--right',
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            loop
            className="hero__swiper"
          >
            {heroSlides.map((slide, index) => {
              const slideImage = slide.image ?? getImageFromAssets(heroImages, index) ?? heroImages[0] ?? null

              return (
                <SwiperSlide key={`${slide.brand}-${slide.title}`}>
                  <div className="hero__slide" style={{ background: themeGradient(slide.theme) }}>
                    <div className="hero__slide-left">
                      <span className="hero__brand">{slide.brand}</span>
                      <h1>{slide.title}</h1>
                      <p>{slide.price}</p>
                      <strong>{slide.subtitle}</strong>
                    </div>
                    <div className="hero__slide-right">
                      {slideImage ? (
                        <img className="hero__slide-image" src={slideImage} alt={slide.title} loading="lazy" />
                      ) : (
                        <div className="hero__device hero__device--fold">
                          <span />
                        </div>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>

          <button type="button" className="hero__arrow hero__arrow--left" aria-label="Trước">
            <ChevronLeft size={24} />
          </button>
          <button type="button" className="hero__arrow hero__arrow--right" aria-label="Sau">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="hero__mini-row">
          {promoTiles.map((promo) => (
            <article key={promo.title} className={`mini-promo ${promo.className}`}>
              {promo.image ? <img className="mini-promo__image" src={promo.image} alt={promo.title} loading="lazy" /> : null}
              <div className="mini-promo__content">
                <span className="mini-promo__title">{promo.title}</span>
                <strong>{promo.subtitle}</strong>
                <span className="mini-promo__discount">{promo.discount}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
