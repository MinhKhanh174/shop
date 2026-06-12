import { useMemo, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { phoneAccessoriesProducts } from '../../../data/homeData'
import { ProductCard } from '../../../shared/ui/ProductCard'
import { SectionHeading } from '../../../shared/ui/SectionHeading'
import { mapProductsToCards } from '../../../utils/productMapper'

const accessoryTabs = [
  { key: 'cable', label: 'Cáp sạc' },
  { key: 'charger', label: 'Củ sạc' },
  { key: 'screen', label: 'Miếng dán màn hình' },
]

function matchAccessoryGroup(product, group) {
  const value = String(product.title ?? product.name ?? '').toLowerCase()

  if (group === 'screen') {
    return /screen|glass|tempered|protector|dán|film/.test(value)
  }

  if (group === 'charger') {
    return /charger|charging|power|adapter|sạc/.test(value)
  }

  return /cable|usb|lightning|type c|cáp/.test(value)
}

export function AccessorySection({ remoteProducts = [] }) {
  const [activeGroup, setActiveGroup] = useState('cable')

  const accessoryProducts = useMemo(() => {
    const remoteAccessoryCards = mapProductsToCards(
      remoteProducts.filter((product) => product.category === 'mobile-accessories'),
      { label: 'Trả góp 0%', type: 'speaker' },
    )

    const filteredRemoteProducts = remoteAccessoryCards.filter((product) => matchAccessoryGroup(product, activeGroup))

    if (filteredRemoteProducts.length > 0) {
      return filteredRemoteProducts.slice(0, 5)
    }

    return phoneAccessoriesProducts.filter((product) => product.group === activeGroup).slice(0, 5)
  }, [activeGroup, remoteProducts])

  return (
    <section className="section section--muted" id="accessory-section">
      <SectionHeading
        eyebrow="Phụ kiện điện thoại"
        title="PHỤ KIỆN ĐIỆN THOẠI"
        action={
          <div className="accessory-tabs" aria-label="Danh mục phụ kiện">
            {accessoryTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={tab.key === activeGroup ? 'is-active' : ''}
                onClick={() => setActiveGroup(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="product-showcase-grid">
        {accessoryProducts.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>

      <div className="product-showcase-action">
        <button type="button" className="button button--ghost">
          Xem tất cả
          <ArrowUpRight size={16} />
        </button>
      </div>
    </section>
  )
}
