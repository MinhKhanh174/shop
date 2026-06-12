import { useMemo, useState } from 'react'
import Card from '../../shared/ui/Card'

function resolveGalleryImages(product) {
  const images = Array.isArray(product?.source?.images) ? product.source.images.filter(Boolean) : []
  const fallbackImage = product?.image ? [product.image] : []
  const uniqueImages = Array.from(new Set([...images, ...fallbackImage]))

  return uniqueImages.length > 0 ? uniqueImages : []
}

export function ProductGallery({ product }) {
  const images = useMemo(() => resolveGalleryImages(product), [product])
  const [activeIndex, setActiveIndex] = useState(0)

  const activeImage = images[activeIndex] || images[0]

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-[28px] bg-slate-50">
          {activeImage ? (
            <img src={activeImage} alt={product.name} className="h-[360px] w-full object-contain p-4 sm:h-[420px]" />
          ) : (
            <div className="flex h-[360px] items-center justify-center text-slate-400 sm:h-[420px]">Không có ảnh</div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`overflow-hidden rounded-2xl border bg-slate-50 transition ${
                activeIndex === index ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <img src={image} alt="" className="h-20 w-full object-contain p-2" />
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}
