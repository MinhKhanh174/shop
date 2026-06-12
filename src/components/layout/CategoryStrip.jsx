import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getCategoryCollectionPath } from '../../utils/categoryRoutes'

export function CategoryStrip({ categoryItems = [] }) {
  const trackRef = useRef(null)
  const stripItems = categoryItems.filter((item) => item.showInStrip)

  const scrollTrack = (direction) => {
    const track = trackRef.current
    if (!track) return

    const amount = Math.max(320, Math.floor(track.clientWidth * 0.8))
    track.scrollBy({
      left: direction * amount,
      behavior: 'smooth',
    })
  }

  if (!stripItems.length) {
    return null
  }

  return (
    <div className="category-strip" aria-label="Nổi bật danh mục">
      <button
        type="button"
        className="category-strip__nav category-strip__nav--left"
        aria-label="Trước"
        onClick={() => scrollTrack(-1)}
      >
        <ChevronLeft size={18} />
      </button>

      <div
        ref={trackRef}
        className="category-strip__track"
      >
        {stripItems.map((item) => {
          const Icon = item.icon
          const targetPath = getCategoryCollectionPath(item.key)

          return (
            <Link
              key={item.key}
              to={targetPath}
              className={`category-strip__item${item.isActive ? ' is-active' : ''}${item.isHot ? ' category-strip__item--hot' : ''}`}
              draggable="false"
            >
              <span className="category-strip__icon-shell" aria-hidden="true">
                {item.isHot ? (
                  <span className="category-strip__hot-badge">HOT</span>
                ) : (
                  <Icon size={30} strokeWidth={1.7} className="category-strip__icon" />
                )}
              </span>
              <span className="category-strip__label">{item.stripLabel}</span>
            </Link>
          )
        })}
      </div>

      <button
        type="button"
        className="category-strip__nav category-strip__nav--right"
        aria-label="Sau"
        onClick={() => scrollTrack(1)}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
