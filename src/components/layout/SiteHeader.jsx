import { useState } from 'react'
import { X } from 'lucide-react'
import promoBannerImage from '../../assets/bannerQC.png'
import { HeaderTop } from './HeaderTop'

function TopAdStrip() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return null
  }

  return (
    <div className="top-ad">
      <div className="top-ad__banner" aria-label="Banner khuyến mãi">
        <img src={promoBannerImage} alt="Chương trình khuyến mãi Techstore" />
      </div>
      <button type="button" className="top-ad__close" aria-label="Đóng banner" onClick={() => setIsVisible(false)}>
        <X size={18} />
      </button>
    </div>
  )
}

export function SiteHeader({ isScrolled }) {
  return (
    <>
      <TopAdStrip />
      <HeaderTop isScrolled={isScrolled} />
    </>
  )
}
