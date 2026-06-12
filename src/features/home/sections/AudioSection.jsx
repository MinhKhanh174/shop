import { useMemo, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { soundProducts } from '../../../data/homeData'
import { ProductCard } from '../../../shared/ui/ProductCard'
import { SectionHeading } from '../../../shared/ui/SectionHeading'
import { mapProductsToCards } from '../../../utils/productMapper'

const audioTabs = [
  { key: 'headphones', label: 'Tai nghe' },
  { key: 'wireless-speakers', label: 'Loa không dây' },
  { key: 'other', label: 'Thiết bị khác' },
]

function matchAudioGroup(product, group) {
  const value = String(product.title ?? product.name ?? '').toLowerCase()

  if (group === 'wireless-speakers') {
    return /speaker|sound|homepod|bass|audio|loa/.test(value)
  }

  if (group === 'headphones') {
    return /airpods|earphones|headphone|headset|wireless earphones|beats/.test(value)
  }

  return !matchAudioGroup(product, 'headphones') && !matchAudioGroup(product, 'wireless-speakers')
}

export function AudioSection({ remoteProducts = [] }) {
  const [activeGroup, setActiveGroup] = useState('headphones')

  const audioProducts = useMemo(() => {
    const remoteAudioCards = mapProductsToCards(
      remoteProducts.filter((product) => product.category === 'mobile-accessories'),
      { label: 'Trả góp 0%', type: 'speaker' },
    )

    const filteredRemoteProducts = remoteAudioCards.filter((product) => matchAudioGroup(product, activeGroup))

    if (filteredRemoteProducts.length > 0) {
      return filteredRemoteProducts.slice(0, 5)
    }

    return soundProducts.filter((product) => product.group === activeGroup).slice(0, 5)
  }, [activeGroup, remoteProducts])

  return (
    <section className="section section--muted" id="audio-section">
      <SectionHeading
        eyebrow="Âm thanh"
        title="ÂM THANH"
        action={
          <div className="accessory-tabs" aria-label="Danh mục âm thanh">
            {audioTabs.map((tab) => (
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
        {audioProducts.map((product) => (
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
