import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { SectionHeading } from '../../shared/ui/SectionHeading.jsx'
import Card from '../../shared/ui/Card.jsx'
import Button from '../../shared/ui/Button.jsx'
import { useHomeData } from '../../hooks/useHomeData'
import { useCart } from '../../hooks/useCart.js'
import { ROUTES } from '../../config/routes'
import { formatCurrency } from '../../utils/currency.js'
import { useProductSearchResults } from './hooks/useProductSearchResults.js'

const categories = ['All', 'Apple', 'Samsung', 'Xiaomi', 'Oppo']

function mapRemoteProduct(product) {
  const price = product.price < 1000 ? Math.round(product.price * 25000) : Math.round(product.price)

  return {
    id: product.id,
    name: product.title,
    brand: product.brand,
    price,
    image: product.thumbnail ?? product.images?.[0] ?? null,
    description: product.description ?? '',
    priceText: formatCurrency(price),
  }
}

function SearchResults({ query, activeCategory, localFilter }) {
  const { addToCart } = useCart()
  const { searchResults, loading, error } = useProductSearchResults(query)

  useEffect(() => {
    if (error) {
      toast.error('Khơng thể tìm kiếm sản phẩm')
    }
  }, [error])

  const filteredProducts = searchResults.filter((product) => {
    const matchCategory = activeCategory === 'All' || product.brand === activeCategory
    const matchSearch = product.name.toLowerCase().includes(localFilter.toLowerCase())
    return matchCategory && matchSearch
  })

  if (loading) {
    return <div className="space-y-8">Đang tìm kiếm &quot;{query}&quot;...</div>
  }

  return <ProductGrid products={filteredProducts} addToCart={addToCart} />
}

function ProductGrid({ products, addToCart }) {
  return (
    <section className="grid gap-5 xl:grid-cols-3">
      {products.length === 0 ? (
        <Card className="col-span-full p-10 text-center text-slate-500">Không tìm thấy sản phẩm phù hợp.</Card>
      ) : (
        products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="h-52 bg-slate-100 p-4">
              <img src={product.image} alt={product.name} className="h-full w-full rounded-3xl object-cover" />
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-500">{product.brand}</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{product.name}</h3>
              <p className="mt-3 text-lg font-bold text-red-600">{product.priceText}</p>
              <p className="mt-2 text-sm text-slate-500 line-clamp-2">{product.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  to={ROUTES.PRODUCT_DETAIL.replace(':productId', String(product.id))}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Chi tiết
                </Link>
                <Button
                  variant="secondary"
                  className="rounded-full px-4 py-2 text-sm"
                  onClick={() => {
                    addToCart(product)
                    toast.success(`Đã thêm ${product.name} vào giỏ`)
                  }}
                >
                  Thêm vào giỏ
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </section>
  )
}

export default function ProductListPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const { products: remoteProducts, loading: remoteLoading } = useHomeData()
  const { addToCart } = useCart()
  const [activeCategory, setActiveCategory] = useState('All')
  const [localFilter, setLocalFilter] = useState('')

  const catalogProducts = useMemo(() => remoteProducts.map(mapRemoteProduct), [remoteProducts])

  const filteredProducts = catalogProducts.filter((product) => {
    const matchCategory = activeCategory === 'All' || product.brand === activeCategory
    const matchSearch = product.name.toLowerCase().includes(localFilter.toLowerCase())
    return matchCategory && matchSearch
  })

  if (!query && remoteLoading) {
    return <div className="space-y-8">Đang tải danh sách sản phẩm...</div>
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-6 shadow-sm">
        <SectionHeading
          title="Danh sách sản phẩm"
          description={query ? `Kết quả tìm kiếm cho "${query}"` : 'Lọc theo thương hiệu và tìm nhanh sản phẩm'}
        />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategory === category ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="relative w-full max-w-sm">
            <input
              placeholder="Tìm sản phẩm"
              value={localFilter}
              onChange={(event) => setLocalFilter(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-red-500"
            />
          </div>
        </div>
      </section>

      {query ? (
        <SearchResults
          key={query}
          query={query}
          activeCategory={activeCategory}
          localFilter={localFilter}
        />
      ) : (
        <ProductGrid products={filteredProducts} addToCart={addToCart} />
      )}
    </div>
  )
}
