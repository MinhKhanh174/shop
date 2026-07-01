import { ChevronRight, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useCompareStore } from '../../store/useCompareStore'

export function CompareTray() {
  const location = useLocation()
  const navigate = useNavigate()
  const compareItems = useCompareStore((state) => state.compareItems)
  const removeFromCompare = useCompareStore((state) => state.removeFromCompare)
  const clearCompare = useCompareStore((state) => state.clearCompare)
  const isTrayCollapsed = useCompareStore((state) => state.isTrayCollapsed)
  const toggleTray = useCompareStore((state) => state.toggleTray)

  if (!compareItems.length || location.pathname === ROUTES.COMPARE) {
    return null
  }

  const handleCompareNow = () => {
    navigate(ROUTES.COMPARE)
  }

  return (
    <div className={`compare-tray${isTrayCollapsed ? ' is-collapsed' : ''}`}>
      <button type="button" className="compare-tray__toggle" onClick={toggleTray}>
        {isTrayCollapsed ? 'Mở so sánh' : 'Thu gọn'}
        <ChevronRight size={16} className={`compare-tray__toggle-icon${isTrayCollapsed ? '' : ' is-open'}`} />
      </button>

      {!isTrayCollapsed ? (
        <div className="compare-tray__panel">
          <div className="compare-tray__items">
            {compareItems.map((item) => (
              <article key={item.id} className="compare-tray__item">
                <button
                  type="button"
                  className="compare-tray__remove"
                  onClick={() => removeFromCompare(item.id)}
                  aria-label={`Xóa ${item.name} khỏi so sánh`}
                >
                  <X size={16} />
                </button>
                <img src={item.image} alt={item.name} className="compare-tray__image" />
                <h3 className="compare-tray__name">{item.name}</h3>
              </article>
            ))}
          </div>

          <div className="compare-tray__actions">
            <button type="button" className="compare-tray__primary" onClick={handleCompareNow}>
              So sánh ngay
            </button>
            <button type="button" className="compare-tray__clear" onClick={clearCompare}>
              Xóa tất cả sản phẩm
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
