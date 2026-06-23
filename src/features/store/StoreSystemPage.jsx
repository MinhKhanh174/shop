import { useMemo, useState } from 'react'
import './StoreSystemPage.css'

const storeData = [
  {
    province: 'Hồ Chí Minh',
    name: 'Chi nhánh Gò Vấp',
    address: '150 Nguyễn Duy Cung, phường 15, quận Gò Vấp, TP Hồ Chí Minh',
    mapQuery: '150 Nguyễn Duy Cung, An Hội Tây, Hồ Chí Minh 727010, Việt Nam',
  },
  {
    province: 'Hồ Chí Minh',
    name: 'Chi nhánh Quận 10',
    address: '45 Thành Thái, phường 14, quận 10, TP Hồ Chí Minh',
    mapQuery: '45 Thành Thái, phường 14, Quận 10, Hồ Chí Minh, Việt Nam',
  },
  {
    province: 'Hà Nội',
    name: 'Chi nhánh Cầu Giấy',
    address: '89 Xuân Thủy, phường Dịch Vọng Hậu, quận Cầu Giấy, Hà Nội',
    mapQuery: '89 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội, Việt Nam',
  },
  {
    province: 'Đà Nẵng',
    name: 'Chi nhánh Hải Châu',
    address: '12 Lê Duẩn, phường Thạch Thang, quận Hải Châu, Đà Nẵng',
    mapQuery: '12 Lê Duẩn, Thạch Thang, Hải Châu, Đà Nẵng, Việt Nam',
  },
]

const provinces = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng']

export default function StoreSystemPage() {
  const [selectedProvince, setSelectedProvince] = useState(provinces[0])

  const provinceStores = useMemo(
    () => storeData.filter((store) => store.province === selectedProvince),
    [selectedProvince],
  )

  const [selectedStoreName, setSelectedStoreName] = useState(provinceStores[0]?.name ?? '')

  const activeStore =
    provinceStores.find((store) => store.name === selectedStoreName) ?? provinceStores[0] ?? null

  const handleProvinceChange = (event) => {
    const nextProvince = event.target.value
    setSelectedProvince(nextProvince)

    const nextStores = storeData.filter((store) => store.province === nextProvince)
    setSelectedStoreName(nextStores[0]?.name ?? '')
  }

  const handleStoreChange = (event) => {
    setSelectedStoreName(event.target.value)
  }

  return (
    <div className="store-page">
      <div className="store-page__inner">
        <div className="store-page__breadcrumb">
          <span>Trang chủ</span>
          <span>/</span>
          <strong>Hệ thống cửa hàng</strong>
        </div>

        <h1 className="store-page__title">Hệ thống cửa hàng</h1>

        <div className="store-page__layout">
          <aside className="store-page__sidebar">
            <h2>Tìm cửa hàng</h2>

            <label className="store-field">
              <span>Chọn tỉnh thành</span>
              <select value={selectedProvince} onChange={handleProvinceChange}>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </label>

            <label className="store-field">
              <span>Chọn cửa hàng</span>
              <select value={selectedStoreName} onChange={handleStoreChange}>
                {provinceStores.map((store) => (
                  <option key={store.name} value={store.name}>
                    {store.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="store-address">
              <div className="store-address__title">
                <span className="store-address__icon" aria-hidden="true">
                  📍
                </span>
                <span>Địa chỉ</span>
              </div>
              <p>{activeStore?.address ?? 'Chưa có cửa hàng phù hợp.'}</p>
            </div>
          </aside>

          <section className="store-page__map-panel">
            {activeStore ? (
              <iframe
                title={`Bản đồ cửa hàng ${activeStore.name}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(activeStore.mapQuery)}&t=m&z=16&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}
