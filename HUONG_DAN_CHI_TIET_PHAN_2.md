# 📚 HƯỚNG DẪN CHI TIẾT - PHẦN 2: UTILITY & HOOK FUNCTIONS

## 📌 Mục lục
1. [Utility Functions (Hàm tiện ích)](#utility-functions)
2. [Custom Hooks (Hook tùy chỉnh)](#custom-hooks)
3. [Các Component quan trọng](#các-component-quan-trọng)

---

## 🔧 Utility Functions

### 1️⃣ **src/utils/productMapper.js** - Chuyển đổi dữ liệu sản phẩm

**Tác dụng**: Chuyển dữ liệu API thô thành định dạng mà giao diện cần

#### Phần 1: Danh sách màu sắc

```javascript
const accentPalette = [
  ['#0f172a', '#3b82f6'],  // Xanh đen + xanh lam
  ['#111827', '#f59e0b'],  // Đen tối + cam
  ['#111827', '#14b8a6'],  // Đen tối + lục
  ['#c2410c', '#fb923c'],  // Cam tối + cam nhạt
  ['#0f172a', '#84cc16'],  // Xanh đen + xanh lá
  ['#2d163e', '#a855f7'],  // Tím tối + tím nhạt
]
// Dùng để tạo gradient màu cho background thẻ sản phẩm
```

#### Phần 2: Ánh xạ danh mục sang kiểu sản phẩm

```javascript
const typeByCategory = {
  smartphones: 'phone',        // Điện thoại
  tablets: 'tablet',           // Máy tính bảng
  'mobile-accessories': 'speaker',  // Phụ kiện (hiển thị như loa)
  'mens-watches': 'watch',     // Đồng hồ nam
  'womens-watches': 'watch',   // Đồng hồ nữ
  laptops: 'phone',            // Laptop (hiển thị như điện thoại)
}
// Mỗi kiểu có cách vẽ khác nhau (SVG khác nhau)
```

#### Phần 3: Hàm chọn màu

```javascript
function pickAccent(seed) {
  // Nhân vào: tên thương hiệu hoặc danh mục (VD: "Apple")
  // Trả ra: cặp màu gradient
  
  if (!seed) {
    return accentPalette[0]  // Nếu không có seed, dùng màu mặc định
  }

  // Chuyển thành chữ thường
  const normalized = String(seed).toLowerCase()
  
  // Tính tổng mã ASCII của tất cả ký tự
  // "apple" → 97 + 112 + 112 + 108 + 101 = 530
  const sum = normalized.split('').reduce((accumulator, char) => 
    accumulator + char.charCodeAt(0), 
  0)

  // Lấy index trong pallete bằng cách chia dư
  // sum % accentPalette.length = 530 % 6 = 2
  // Trả về pallete[2] = ['#111827', '#14b8a6']
  return accentPalette[sum % accentPalette.length]
}
```

**Cơ chế**: Cùng tên thương hiệu luôn lấy được cùng một cặp màu!
```
"Apple" → 530 → 530 % 6 = 2 → ['#111827', '#14b8a6']
"apple" → 530 → 530 % 6 = 2 → ['#111827', '#14b8a6']  (cùng kết quả!)
"Samsung" → ... % 6 = 0 → ['#0f172a', '#3b82f6']  (màu khác)
```

#### Phần 4: Hàm chuyển đổi giá

```javascript
function formatMoney(value) {
  // Nhân vào: giá từ API (VD: 999.99 hoặc 1200)
  // Trả ra: giá đã được chuyển đổi
  
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0  // Nếu không phải số, trả 0
  }

  if (value < 1000) {
    // Nếu giá dưới 1000: nhân với 25000
    // API: 199.99 → UI: 199.99 * 25000 = 4,999,750đ
    return Math.round(value * 25000)
  } else {
    // Nếu giá từ 1000 trở lên: giữ nguyên và làm tròn
    // API: 1099 → UI: 1,099đ
    return Math.round(value)
  }
}
```

**Tại sao?** Vì API DummyJSON sử dụng USD (giá rẻ), nhưng giao diện cần giá VNĐ (đắt hơn). Nhân 25000 để chuyển tỉ giá!

#### Phần 5: Hàm chính - Chuyển sản phẩm API thành thẻ sản phẩm

```javascript
export function mapApiProductToCard(product, overrides = {}) {
  // Nhân vào: object sản phẩm từ API + các giá trị ghi đè
  // Trả ra: object sản phẩm đã định dạng cho giao diện
  
  // Chọn màu (dùng màu override nếu có, không thì tính từ brand)
  const accent = overrides.accent ?? pickAccent(product.brand ?? product.category)
  
  // Tính giá (dùng override nếu có, không thì dùng formatMoney)
  const price = overrides.price ?? formatMoney(product.price)
  
  // Tính giá cũ (để hiển thị giá gạch ngang)
  // VD: giá cũ 10tr, giảm 10%, giá mới 9tr
  const oldPrice =
    overrides.oldPrice ??
    (typeof product.discountPercentage === 'number' && product.discountPercentage > 0
      ? Math.round(price / (1 - product.discountPercentage / 100))
      : undefined)

  return {
    id: overrides.id ?? String(product.id),              // ID sản phẩm
    brand: product.brand ?? overrides.brand ?? 'DummyJSON',  // Thương hiệu
    name: product.title ?? overrides.name ?? 'Sản phẩm', // Tên sản phẩm
    price,                                               // Giá mới
    oldPrice,                                            // Giá cũ
    badge: overrides.badge ?? (product.discountPercentage > 0 
      ? `-${Math.round(product.discountPercentage)}%`   // Badge "-10%"
      : null),
    label: overrides.label ?? 'Trả góp 0%',            // Nhãn phụ
    perk: overrides.perk ?? (product.discountPercentage > 0 ? 'Trả góp 0%' : ''),
    accent,                                              // Màu gradient
    type: overrides.type ?? typeByCategory[product.category] ?? 'phone',  // Kiểu hiển thị
    image: overrides.image ?? product.thumbnail ?? product.images?.[0] ?? null,  // Hình ảnh
  }
}
```

#### Ví dụ thực tế

**Input (API):**
```javascript
{
  id: 121,
  title: 'iPhone 5s',
  brand: 'Apple',
  category: 'smartphones',
  price: 199.99,
  discountPercentage: 12.96,
  thumbnail: 'https://dummyjson.com/.../image.jpg'
}
```

**Output (UI):**
```javascript
{
  id: '121',
  name: 'iPhone 5s',
  brand: 'Apple',
  price: 4999750,                    // 199.99 * 25000 = 4,999,750đ
  oldPrice: 5735200,                 // Giá cũ (gạch ngang)
  badge: '-13%',                     // Hiển thị mức giảm
  label: 'Trả góp 0%',
  perk: 'Trả góp 0%',
  accent: ['#0f172a', '#3b82f6'],    // Gradient xanh (từ "Apple")
  type: 'phone',                     // Vẽ như điện thoại
  image: 'https://...',              // URL hình ảnh
}
```

**Hiển thị trên UI:**
```
┌──────────────────────┐
│  [-13%]              │  ← Badge
│  [Hình iPhone]       │
├──────────────────────┤
│  iPhone 5s           │  ← name
│ 5.735.200đ           │  ← oldPrice (gạch ngang)
│ 4.999.750đ           │  ← price (màu đỏ/màu chính)
│ [Thêm vào giỏ +]     │
├──────────────────────┤
│ Trả góp 0%           │  ← perk
└──────────────────────┘
```

#### Các hàm lọc khác

```javascript
export function filterTechProducts(products) {
  // Lọc chỉ giữ sản phẩm công nghệ
  return products.filter(p => techCategories.has(p.category))
}

export function filterProductsBySupportedBrand(products) {
  // Lọc chỉ giữ những sản phẩm có thương hiệu được hỗ trợ
  return products.filter(p => selectedBrands.includes(p.brand))
}

export function getRemoteBrands(products) {
  // Trích danh sách những thương hiệu xuất hiện trong sản phẩm
  // Input: [{ brand: 'Apple' }, { brand: 'Samsung' }, { brand: 'Apple' }, ...]
  // Output: ['Apple', 'Samsung']
  const unique = new Set(products.map(p => p.brand).filter(Boolean))
  return Array.from(unique).sort()
}
```

---

### 2️⃣ **src/utils/currency.js** - Định dạng tiền tệ

```javascript
export function formatCurrency(value) {
  // Nhân vào: số tiền (VD: 4999750)
  // Trả ra: chuỗi định dạng (VD: "4.999.750đ")
  
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '0đ'  // Nếu không phải số, trả "0đ"
  }

  // Sử dụng Intl.NumberFormat để định dạng theo locale Việt Nam
  // Tự động thêm dấu chấm sau mỗi 3 chữ số
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
  // 4999750 → "4.999.750đ"
}

export function formatPercent(value) {
  // Nhân vào: phần trăm (VD: -13 hoặc 25)
  // Trả ra: chuỗi với dấu % (VD: "-13%" hoặc "+25%")
  
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '0%'
  }

  // Nếu dương, thêm dấu "+"
  return `${value > 0 ? '+' : ''}${value}%`
  // -13 → "-13%"
  // 25 → "+25%"
}
```

---

## 🎣 Custom Hooks (Hook tùy chỉnh)

### 1️⃣ **src/hooks/useScrollShadow.js** - Theo dõi cuộn

```javascript
import { useEffect, useState } from 'react'

export function useScrollShadow(threshold = 8) {
  // Nhân vào: ngưỡng (8px mặc định) - khi cuộn dưới 8px, thêm bóng
  // Trả ra: true/false - có cuộn xuống chưa?
  
  // State lưu trạng thái cuộn
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    // Hàm xử lý sự kiện cuộn
    const handleScroll = () => {
      // window.scrollY = vị trí cuộn hiện tại (đơn vị: pixels)
      // Nếu scrollY > 8px, coi là đã cuộn
      setIsScrolled(window.scrollY > threshold)
    }

    // Gọi hàm ngay để kiểm tra lần đầu
    handleScroll()
    
    // Lắng nghe sự kiện cuộn
    // { passive: true } = không block scroll (tối ưu hiệu suất)
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup: dừng lắng nghe khi component bị xóa
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])  // Chạy lại nếu threshold thay đổi

  return isScrolled  // Trả về true/false
}
```

**Ví dụ sử dụng:**

```javascript
// Trong App.jsx
const isScrolled = useScrollShadow()

return (
  <header className={isScrolled ? 'header--scrolled' : ''}>
    {/* Header có bóng khi cuộn xuống */}
  </header>
)
```

**Kết quả:**
```
┌─────────────────┐
│ Header (mới mở) │  ← Không có bóng (window.scrollY = 0)
└─────────────────┘

   ↓ (Cuộn xuống...)

┌─────────────────┐
│ Header          │ ← Có bóng (window.scrollY > 8)
╠═════════════════╣
│ Nội dung        │
└─────────────────┘
```

---

### 2️⃣ **src/hooks/useRouteCategorySync.js** - Đồng bộ menu theo trang

**Tác dụng**: Khi vào trang chủ, mở menu danh mục. Khi ra trang khác, đóng menu.

```javascript
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useHomeStore } from '../store/useHomeStore'

export function useRouteCategorySync() {
  // Lấy trang hiện tại
  const location = useLocation()
  
  // Lấy hàm mở/đóng menu từ Zustand store
  const openCategoryMenu = useHomeStore((state) => state.openCategoryMenu)
  const closeCategoryMenu = useHomeStore((state) => state.closeCategoryMenu)

  useEffect(() => {
    // Nếu ở trang chủ ("/"), mở menu
    if (location.pathname === '/') {
      openCategoryMenu()
    } else {
      // Nếu không, đóng menu
      closeCategoryMenu()
    }
  }, [location.pathname])  // Chạy lại khi đường dẫn thay đổi
}
```

**Ví dụ:**
```
Người dùng tại "/" (trang chủ)
    ↓
isCategoryMenuOpen = true  ← Menu mở

Người dùng đi tới "/notfound"
    ↓
location.pathname = "/notfound"
    ↓
isCategoryMenuOpen = false  ← Menu đóng
```

---

## 🎨 Các Component quan trọng

### 1️⃣ **src/shared/ui/SectionHeading.jsx** - Tiêu đề section

```javascript
import { ChevronRight } from 'lucide-react'

export function SectionHeading({ eyebrow, title, href = '#', accentColor }) {
  // Normalize cả eyebrow và title thành lowercase để so sánh
  const normalizedEyebrow = String(eyebrow ?? '').trim().toLowerCase()
  const normalizedTitle = String(title ?? '').trim().toLowerCase()
  
  // Chỉ hiển thị eyebrow nếu nó khác với title (tránh lặp lại)
  const shouldShowEyebrow = eyebrow && normalizedEyebrow !== normalizedTitle

  return (
    <header className={`section-heading${accentColor ? ' section-heading--' + accentColor : ''}`}>
      <div>
        {/* Tiêu đề phụ (text nhỏ) - chỉ hiển thị nếu khác title */}
        {shouldShowEyebrow ? <p className="section-heading__eyebrow">{eyebrow}</p> : null}
        
        {/* Tiêu đề chính (text lớn) */}
        <h2 className="section-heading__title">{title}</h2>
      </div>
      
      {/* Nút "Xem thêm" */}
      <a href={href} className="section-heading__link">
        Xem thêm
        <ChevronRight size={16} />
      </a>
    </header>
  )
}
```

**Cách sử dụng:**

```javascript
// Trường hợp 1: eyebrow và title khác nhau
<SectionHeading 
  eyebrow="Điện thoại nổi bật" 
  title="ĐIỆN THOẠI THÔNG MINH"
/>
// Hiển thị:
// Điện thoại nổi bật       ← Hiển thị
// ĐIỆN THOẠI THÔNG MINH    ← Hiển thị

// Trường hợp 2: eyebrow và title giống nhau
<SectionHeading 
  eyebrow="Đồng hồ thông minh" 
  title="ĐỒNG HỒ THÔNG MINH"
/>
// Hiển thị:
// ĐỒNG HỒ THÔNG MINH       ← Chỉ hiển thị title
```

---

### 2️⃣ **src/components/home/FlashSaleSection.jsx** - Flash Sale

**Tác dụng**: Hiển thị sản phẩm giảm giá "flash sale"

```javascript
import { ProductCard } from '../../shared/ui/ProductCard'
import { SectionHeading } from '../../shared/ui/SectionHeading'
import { flashSaleProducts } from '../../data/homeData'

export function FlashSaleSection({ products, remoteProducts }) {
  // Cố gắng lấy sản phẩm từ remote (API) trước
  const flashSaleItems = remoteProducts && remoteProducts.length > 0
    ? remoteProducts.slice(0, 8)  // Lấy 8 sản phẩm đầu
    : products  // Fallback: dùng static data

  return (
    <section className="section">
      <div className="section__bounds">
        {/* Tiêu đề */}
        <SectionHeading 
          eyebrow="Flash sale hôm nay" 
          title="FLASH SALE"
        />

        {/* Danh sách sản phẩm */}
        <div className="section__grid">
          {flashSaleItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

### 3️⃣ **src/components/layout/SearchBar.jsx** - Thanh tìm kiếm

```javascript
import { Search } from 'lucide-react'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { searchProducts } from '../../services/homeApi'

export function SearchBar() {
  const [isFocused, setIsFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef(null)

  const handleSearch = async (e) => {
    e.preventDefault()  // Ngăn reload trang

    if (!searchQuery.trim()) {
      toast.error('Vui lòng nhập từ khóa tìm kiếm')
      return
    }

    try {
      // Gọi API tìm kiếm
      const response = await searchProducts(searchQuery)
      const results = response.data?.products ?? []
      
      if (results.length === 0) {
        toast.error(`Không tìm thấy: "${searchQuery}"`)
      } else {
        toast.success(`Tìm thấy ${results.length} sản phẩm`)
        // Trong thực tế, lẽ nên chuyển hướng tới trang kết quả
      }
      
      // Xóa input
      setSearchQuery('')
    } catch (error) {
      toast.error('Lỗi tìm kiếm. Vui lòng thử lại')
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <button type="submit" className="search-bar__button">
        <Search size={16} />
      </button>
    </form>
  )
}
```

---

### 4️⃣ **src/features/home/sections/PhoneShowcaseSection.jsx** - Danh sách điện thoại

**Tác dụng**: Hiển thị điện thoại theo thương hiệu (tab Apple, Samsung, Oppo, v.v.)

```javascript
import { useCallback } from 'react'
import { useHomeStore } from '../../../store/useHomeStore'
import { ProductCard } from '../../../shared/ui/ProductCard'
import { mapApiProductToCard } from '../../../utils/productMapper'
import { SectionHeading } from '../../../shared/ui/SectionHeading'
import { brands } from '../home.constants'

export function PhoneShowcaseSection({ remoteProducts, remoteBrands }) {
  // Lấy thương hiệu được chọn từ store
  const selectedBrand = useHomeStore((state) => state.selectedBrand)
  const setSelectedBrand = useHomeStore((state) => state.setSelectedBrand)

  // Lọc sản phẩm theo thương hiệu được chọn
  const displayBrands = remoteBrands && remoteBrands.length > 0 ? remoteBrands : brands
  
  // Lọc chỉ lấy sản phẩm của thương hiệu này
  const phonesOfBrand = remoteProducts?.filter(
    (p) => p.brand === selectedBrand && p.category === 'smartphones'
  ) ?? []

  // Chuyển đổi sang định dạng UI
  const displayProducts = phonesOfBrand.map((p) => mapApiProductToCard(p))

  // Hàm chuyển brand
  const handleBrandChange = useCallback((brand) => {
    setSelectedBrand(brand)
  }, [setSelectedBrand])

  return (
    <section className="section section--phones">
      <div className="section__bounds">
        <SectionHeading eyebrow="Điện thoại" title="ĐIỆN THOẠI NỔI BẬT" />

        {/* Tab chọn thương hiệu */}
        <nav className="phones__brands">
          {displayBrands.map((brand) => (
            <button
              key={brand}
              className={`phones__brand-tab ${selectedBrand === brand ? 'phones__brand-tab--active' : ''}`}
              onClick={() => handleBrandChange(brand)}
            >
              {brand}
            </button>
          ))}
        </nav>

        {/* Danh sách sản phẩm */}
        <div className="section__grid">
          {displayProducts.length > 0 ? (
            displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="section__empty">Không có sản phẩm cho thương hiệu này</p>
          )}
        </div>
      </div>
    </section>
  )
}
```

**Luồng hoạt động:**

```
1. Trang tải, selectedBrand = "Apple"
          ↓
2. Lọc sản phẩm: remoteProducts.filter(p => p.brand === "Apple")
          ↓
3. Hiển thị danh sách điện thoại Apple
          ↓
4. Người dùng nhấn tab "Samsung"
          ↓
5. Gọi setSelectedBrand("Samsung")
          ↓
6. Component re-render với selectedBrand = "Samsung"
          ↓
7. Lọc sản phẩm Samsung mới
          ↓
8. Hiển thị danh sách điện thoại Samsung
```

---

### 5️⃣ **src/features/home/sections/WatchSection.jsx** - Phần đồng hồ

```javascript
import { mapApiProductToCard } from '../../../utils/productMapper'
import { ProductCard } from '../../../shared/ui/ProductCard'
import { SectionHeading } from '../../../shared/ui/SectionHeading'

export function WatchSection({ remoteProducts, watchBannerImage }) {
  // Lọc chỉ lấy đồng hồ
  const watches = remoteProducts?.filter(
    (p) => p.category === 'mens-watches' || p.category === 'womens-watches'
  ) ?? []

  // Chuyển đổi sang định dạng UI
  const displayProducts = watches.slice(0, 8).map((p) => mapApiProductToCard(p))

  return (
    <section className="section section--watches">
      <div className="section__bounds">
        <SectionHeading eyebrow="Đồng hồ" title="ĐỒ THỜI GIAN THÔNG MINH" />

        {watchBannerImage && (
          <div className="watches__banner">
            <img src={watchBannerImage} alt="Banner đồng hồ" />
          </div>
        )}

        <div className="section__grid">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

### 6️⃣ **src/features/home/sections/AccessorySection.jsx** - Phần phụ kiện

```javascript
import { useMemo } from 'react'
import { mapApiProductToCard } from '../../../utils/productMapper'
import { ProductCard } from '../../../shared/ui/ProductCard'
import { SectionHeading } from '../../../shared/ui/SectionHeading'

export function AccessorySection({ remoteProducts }) {
  // Các kiểu phụ kiện
  const accessoryTypes = ['screen', 'charger', 'cable']
  const [activeTab, setActiveTab] = useMemo(() => ['screen', () => {}], [])

  // Hàm kiểm tra sản phẩm có phù hợp với tab không
  function matchAccessoryGroup(product, groupType) {
    const title = String(product.title ?? '').toLowerCase()
    
    if (groupType === 'screen') {
      return /screen|glass|protector/.test(title)  // Cảm kiếm: screen, glass, protector
    }
    if (groupType === 'charger') {
      return /charger|power|adapter/.test(title)   // Cảm kiếm: charger, power, adapter
    }
    if (groupType === 'cable') {
      return /cable|usb|lightning/.test(title)     // Cảm kiếm: cable, usb, lightning
    }
    
    return false
  }

  // Lọc phụ kiện theo tab
  const accessories = remoteProducts?.filter(
    (p) => p.category === 'mobile-accessories' && matchAccessoryGroup(p, activeTab)
  ) ?? []

  const displayProducts = accessories.slice(0, 8).map((p) => mapApiProductToCard(p))

  return (
    <section className="section">
      <div className="section__bounds">
        <SectionHeading eyebrow="Phụ kiện" title="PHỤ KIỆN ĐIỆN THOẠI" />

        {/* Tab chọn loại phụ kiện */}
        <nav className="tabs">
          {accessoryTypes.map((type) => (
            <button
              key={type}
              className={`tab ${activeTab === type ? 'tab--active' : ''}`}
              onClick={() => setActiveTab(type)}
            >
              {type === 'screen' && 'Kính cường lực'}
              {type === 'charger' && 'Sạc nhanh'}
              {type === 'cable' && 'Cáp sạc'}
            </button>
          ))}
        </nav>

        <div className="section__grid">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

### 7️⃣ **src/features/home/sections/AudioSection.jsx** - Phần tai nghe & loa

```javascript
import { mapApiProductToCard } from '../../../utils/productMapper'
import { ProductCard } from '../../../shared/ui/ProductCard'
import { SectionHeading } from '../../../shared/ui/SectionHeading'

export function AudioSection({ remoteProducts }) {
  const audioTypes = ['earbuds', 'speakers', 'other']
  const [activeTab, setActiveTab] = useState('earbuds')

  // Hàm kiểm tra sản phẩm audio
  function matchAudioGroup(product, groupType) {
    const title = String(product.title ?? '').toLowerCase()
    
    if (groupType === 'earbuds') {
      // Cảm kiếm: headphones, airpods, beats, earbuds
      return /headphone|airpod|beat|earbud/.test(title)
    }
    if (groupType === 'speakers') {
      // Cảm kiếm: speaker, loa, homepod
      return /speaker|loa|homepod/.test(title)
    }
    
    return true  // Loại khác
  }

  // Lọc audio theo tab
  const audioProducts = remoteProducts?.filter(
    (p) => matchAudioGroup(p, activeTab)
  ) ?? []

  const displayProducts = audioProducts.slice(0, 8).map((p) => mapApiProductToCard(p))

  return (
    <section className="section">
      <div className="section__bounds">
        <SectionHeading eyebrow="Âm thanh" title="TAI NGHE & LOA CHẤT LƯỢNG" />

        {/* Tab chọn loại audio */}
        <nav className="tabs">
          <button onClick={() => setActiveTab('earbuds')} className={activeTab === 'earbuds' ? 'active' : ''}>
            Tai nghe
          </button>
          <button onClick={() => setActiveTab('speakers')} className={activeTab === 'speakers' ? 'active' : ''}>
            Loa
          </button>
          <button onClick={() => setActiveTab('other')} className={activeTab === 'other' ? 'active' : ''}>
            Khác
          </button>
        </nav>

        <div className="section__grid">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

### 8️⃣ **src/components/layout/CategoryMenu.jsx** - Menu danh mục

**Tác dụng**: Menu mở ra khi hover, hiển thị danh mục sản phẩm

```javascript
import { useEffect, useState } from 'react'
import { useHomeStore } from '../../store/useHomeStore'
import { CategoryMegaPanel } from './CategoryMegaPanel'

export function CategoryMenu({ categoryItems, remoteProducts }) {
  const isCategoryMenuOpen = useHomeStore((state) => state.isCategoryMenuOpen)
  const openCategoryMenu = useHomeStore((state) => state.openCategoryMenu)
  const closeCategoryMenu = useHomeStore((state) => state.closeCategoryMenu)
  
  const [hoverTimer, setHoverTimer] = useState(null)

  // Xử lý khi hover vào menu
  const handleMouseEnter = () => {
    // Xóa timer cũ (nếu có)
    if (hoverTimer) clearTimeout(hoverTimer)
    
    // Chợ 140ms để tránh flicker
    setHoverTimer(setTimeout(() => openCategoryMenu(), 140))
  }

  // Xử lý khi rời khỏi menu
  const handleMouseLeave = () => {
    if (hoverTimer) clearTimeout(hoverTimer)
    
    // Chợ 140ms trước khi đóng
    setHoverTimer(setTimeout(() => closeCategoryMenu(), 140))
  }

  return (
    <div 
      className={`category-menu ${isCategoryMenuOpen ? 'category-menu--open' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="category-menu__trigger">
        ☰ Danh mục
      </button>

      {isCategoryMenuOpen && (
        <CategoryMegaPanel categoryItems={categoryItems} remoteProducts={remoteProducts} />
      )}
    </div>
  )
}
```

---

## 📊 Tóm tắt các phần chính

| File | Tác dụng | Công nghệ |
|------|---------|-----------|
| productMapper.js | Chuyển đổi dữ liệu API → UI | Pure JS |
| currency.js | Định dạng tiền tệ & phần trăm | Intl API |
| useScrollShadow | Theo dõi cuộn trang | React Hooks |
| useRouteCategorySync | Đồng bộ menu theo trang | React Router + Zustand |
| SectionHeading | Tiêu đề section | React + Lucide |
| ProductCard | Thẻ sản phẩm | React + Toast |
| PhoneShowcaseSection | Danh sách điện thoại | React + Zustand |
| WatchSection | Danh sách đồng hồ | React |
| AccessorySection | Danh sách phụ kiện | React |
| AudioSection | Danh sách tai nghe | React |
| SearchBar | Thanh tìm kiếm | React + Axios |
| NewsletterForm | Form đăng ký | React Hook Form + Zod |

---

**💡 Quan trọng: Tất cả các component đều có thể:**
1. Nhận dữ liệu từ props
2. Lưu trữ trạng thái bằng useState
3. Gọi API bằng Axios (tùy chọn)
4. Hiển thị UI bằng JSX
5. Gửi thông báo bằng Toast

