import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function CategoryStrip({ categoryItems = [] }) {
  const trackRef = useRef(null)
  const dragStateRef = useRef({
    isDown: false,
    startX: 0,
    startScrollLeft: 0,
    hasDragged: false,
  })
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

  const handlePointerDown = (event) => {
    const track = trackRef.current
    if (!track || event.button !== 0) return

    dragStateRef.current.isDown = true
    dragStateRef.current.hasDragged = false
    dragStateRef.current.startX = event.clientX
    dragStateRef.current.startScrollLeft = track.scrollLeft
    track.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    const track = trackRef.current
    const state = dragStateRef.current

    if (!track || !state.isDown) return

    const delta = event.clientX - state.startX
    if (Math.abs(delta) > 4) {
      state.hasDragged = true
    }

    track.scrollLeft = state.startScrollLeft - delta
  }

  const endDrag = (event) => {
    const track = trackRef.current
    const state = dragStateRef.current

    if (!state.isDown) return

    state.isDown = false
    if (track && event?.pointerId != null) {
      track.releasePointerCapture?.(event.pointerId)
    }
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        {stripItems.map((item) => {
          const Icon = item.icon
          const handleClick = (event) => {
            if (dragStateRef.current.hasDragged) {
              event.preventDefault()
              event.stopPropagation()
            }
          }

          return (
            <a
              key={item.key}
              href={item.href}
              className={`category-strip__item${item.isActive ? ' is-active' : ''}${item.isHot ? ' category-strip__item--hot' : ''}`}
              onClick={handleClick}
            >
              <span className="category-strip__icon-shell" aria-hidden="true">
                {item.isHot ? (
                  <span className="category-strip__hot-badge">HOT</span>
                ) : (
                  <Icon size={30} strokeWidth={1.7} className="category-strip__icon" />
                )}
              </span>
              <span className="category-strip__label">{item.stripLabel}</span>
            </a>
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
