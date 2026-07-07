import { useEffect, useMemo, useState } from 'react'
import { Edit3, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react'

import AdminBadge from '../components/ui/AdminBadge'
import AdminButton from '../components/ui/AdminButton'
import AdminTable from '../components/ui/AdminTable'
import { formatCurrency } from '../../utils/formatCurrency'
import { getProductCategoryLabel, getProducts } from '../services/adminProductService'

const cardBase = 'rounded-[28px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]'

function formatDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function statusTone(status) {
  return status === 'active' ? 'success' : 'neutral'
}

function statusLabel(status) {
  return status === 'active' ? 'Đang bán' : 'Ngừng bán'
}

function EmptyState() {
  return (
    <div className={`${cardBase} px-6 py-16 text-center`}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Search size={22} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950">Không tìm thấy sản phẩm</h3>
      <p className="mt-2 text-sm text-slate-500">Hãy thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem dữ liệu phù hợp hơn.</p>
    </div>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')

  useEffect(() => {
    let active = true

    void getProducts().then((data) => {
      if (active) {
        setProducts(data)
      }
    })

    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(() => {
    return ['all', ...new Set(products.map((product) => product.category))]
  }, [products])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        [product.name, product.sku, product.brand, product.category].some((value) =>
          String(value ?? '').toLowerCase().includes(normalizedSearch),
        )

      const matchesCategory = category === 'all' || product.category === category
      const matchesStatus = status === 'all' || product.status === status

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [category, products, search, status])

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Quản lý cửa hàng</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Quản lý sản phẩm</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Theo dõi danh mục sản phẩm, tồn kho và trạng thái bán hàng trong giao diện quản trị gọn gàng, dễ đọc.
          </p>
        </div>

        <AdminButton>
          <Plus size={16} />
          Thêm sản phẩm
        </AdminButton>
      </div>

      <div className={`${cardBase} space-y-4 p-5`}>
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm sản phẩm, SKU, thương hiệu..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <span className="text-sm font-medium text-slate-500">Danh mục</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="ml-auto w-full bg-transparent text-sm text-slate-700 outline-none"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'Tất cả danh mục' : getProductCategoryLabel(item)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <span className="text-sm font-medium text-slate-500">Trạng thái</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="ml-auto w-full bg-transparent text-sm text-slate-700 outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngừng bán</option>
            </select>
          </label>

          <AdminButton variant="secondary" className="justify-center">
            <SlidersHorizontal size={16} />
            Bộ lọc
          </AdminButton>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">
            Hiển thị <span className="font-semibold text-slate-950">{filteredProducts.length.toLocaleString('vi-VN')}</span> /{' '}
            <span className="font-semibold text-slate-950">{products.length.toLocaleString('vi-VN')}</span> sản phẩm
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <AdminBadge tone="info">{categories.length - 1} danh mục</AdminBadge>
            <AdminBadge tone="success">{products.filter((product) => product.status === 'active').length} đang bán</AdminBadge>
          </div>
        </div>
      </div>

      {filteredProducts.length ? (
        <AdminTable>
          <thead className="bg-slate-50/90">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <th className="px-5 py-4">Hình ảnh</th>
              <th className="px-5 py-4">Mã SKU</th>
              <th className="px-5 py-4">Tên sản phẩm</th>
              <th className="px-5 py-4">Danh mục</th>
              <th className="px-5 py-4">Thương hiệu</th>
              <th className="px-5 py-4">Giá</th>
              <th className="px-5 py-4">Tồn kho</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="text-sm text-slate-700 transition-colors hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-14 w-14 rounded-2xl border border-slate-200 object-cover shadow-sm"
                  />
                </td>
                <td className="px-5 py-4 font-medium text-slate-950">{product.sku}</td>
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-slate-950">{product.name}</p>
                    <p className="mt-1 text-xs text-slate-500">Ngày tạo: {formatDate(product.createdAt)}</p>
                  </div>
                </td>
                <td className="px-5 py-4">{product.categoryLabel ?? getProductCategoryLabel(product.category)}</td>
                <td className="px-5 py-4">{product.brand}</td>
                <td className="px-5 py-4 font-semibold text-slate-950">{formatCurrency(product.price)}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    {product.stock}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <AdminBadge tone={statusTone(product.status)}>{statusLabel(product.status)}</AdminBadge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <AdminButton variant="secondary" size="sm">
                      <Edit3 size={14} />
                      Sửa
                    </AdminButton>
                    <AdminButton variant="danger" size="sm">
                      <Trash2 size={14} />
                      Xóa
                    </AdminButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : (
        <EmptyState />
      )}
    </section>
  )
}
