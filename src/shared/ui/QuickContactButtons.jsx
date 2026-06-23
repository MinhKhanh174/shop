import { useEffect, useState } from 'react'
import { ChevronUp, Phone } from 'lucide-react'
import zaloIcon from '../../assets/UngDung/Zalo.png'

const HOTLINE = '19006750'
const ZALO_URL = 'https://zalo.me/19006750'

export function QuickContactButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const threshold = 40

    const updateVisibility = () => {
      setShowScrollTop(window.scrollY > threshold)
    }

    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateVisibility)
    }
  }, [])

  return (
    <div className="quick-contact" aria-label="Liên hệ nhanh">
      <div className="quick-contact__stack">
        <button
          type="button"
          className={`quick-contact__button quick-contact__button--top${showScrollTop ? ' is-visible' : ''}`}
          onClick={handleScrollTop}
          aria-label="Cuộn lên đầu trang"
          title="Lên đầu trang"
          aria-hidden={!showScrollTop}
          tabIndex={showScrollTop ? 0 : -1}
        >
          <ChevronUp size={28} strokeWidth={2.8} />
        </button>

        <a
          className="quick-contact__button quick-contact__button--phone"
          href={`tel:${HOTLINE}`}
          aria-label={`Gọi ${HOTLINE}`}
          title={`Gọi ${HOTLINE}`}
        >
          <Phone size={24} strokeWidth={2.6} />
        </a>

        <a
          className="quick-contact__button quick-contact__button--zalo"
          href={ZALO_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Liên hệ qua Zalo"
          title="Liên hệ qua Zalo"
        >
          <img src={zaloIcon} alt="" aria-hidden="true" />
          <span className="quick-contact__zalo-text">Zalo</span>
        </a>
      </div>
    </div>
  )
}
