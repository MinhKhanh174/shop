import { useSearchParams } from 'react-router-dom'
import Card from '../../shared/ui/Card.jsx'
import { SectionHeading } from '../../shared/ui/SectionHeading.jsx'
import { useCompareStore } from '../../store/useCompareStore'
import { useCompareProducts } from './hooks/useCompareProducts.js'

function CompareContent({ ids }) {
  const { products: compareProducts, loading } = useCompareProducts(ids)

  if (loading) {
    return <div className="space-y-8">Đang tải dữ liệu so sánh...</div>
  }

  if (!compareProducts.length) {
    return (
      <div className="space-y-8">
        <SectionHeading title="So sánh sản phẩm" description="Không có sản phẩm để so sánh" />
        <Card className="p-10 text-center text-slate-500">
          Thêm tham số ?ids=1,2,3 vào URL để so sánh sản phẩm.
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <SectionHeading title="So sánh sản phẩm" description="So sánh các thông số quan trọng theo sản phẩm" />
      <div className="overflow-x-auto rounded-[32px] bg-white p-6 shadow-sm">
        <table className="min-w-full table-auto border-separate border-spacing-y-4 text-left">
          <thead>
            <tr>
              <th className="pb-3 pr-6 text-sm font-semibold text-slate-500">Thuộc tính</th>
              {compareProducts.map((product) => (
                <th key={product.id} className="pb-3 pr-6 text-sm font-semibold text-slate-500">
                  {product.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(compareProducts[0]?.specs ?? {}).map(([label]) => (
              <tr key={label} className="border-t border-slate-200">
                <td className="py-4 pr-6 text-sm font-medium text-slate-700">{label}</td>
                {compareProducts.map((product) => (
                  <td key={`${product.id}-${label}`} className="py-4 pr-6 text-sm text-slate-600">
                    {product.specs?.[label] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-slate-200">
              <td className="py-4 pr-6 text-sm font-medium text-slate-700">Giá</td>
              {compareProducts.map((product) => (
                <td key={`${product.id}-price`} className="py-4 pr-6 text-sm text-slate-600">
                  {product.priceText}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {compareProducts.map((product) => (
          <Card key={product.id} className="p-5">
            <p className="text-sm text-slate-500">{product.brand}</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">{product.name}</h3>
            <p className="mt-3 text-xl font-bold text-red-600">{product.priceText}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function ComparePage() {
  const [searchParams] = useSearchParams()
  const idsParam = searchParams.get('ids')
  const compareIds = useCompareStore((state) => state.getCompareIds())
  const ids = idsParam
    ? idsParam.split(',').map((id) => id.trim()).filter(Boolean)
    : compareIds
  const idsKey = ids.join(',')

  return <CompareContent key={idsKey} ids={ids} />
}
