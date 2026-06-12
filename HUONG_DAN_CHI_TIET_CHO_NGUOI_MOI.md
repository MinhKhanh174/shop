# 📚 HƯỚNG DẪN CHI TIẾT DỰ ÁN TECHSTORE - DỄ HIỂU CHO NGƯỜI MỚI

## ⏰ Mục lục nhanh
1. [Dự án là cái gì?](#dự-án-là-cái-gì)
2. [Cơ chế hoạt động chung](#cơ-chế-hoạt-động-chung)
3. [Các công nghệ sử dụng](#các-công-nghệ-sử-dụng)
4. [Giải thích từng file quan trọng](#giải-thích-từng-file-quan-trọng)

---

## 🎯 Dự án là cái gì?

### Tóm tắt nhanh
**TechStore** là một **trang web bán hàng điện tử** (cửa hàng online) bán các sản phẩm công nghệ như:
- 📱 Điện thoại (iPhone, Samsung, Oppo, Xiaomi)
- ⌚ Đồng hồ thông minh (Apple Watch, Rolex)
- 🎧 Tai nghe, loa
- 🔋 Phụ kiện điện thoại (cáp sạc, củ sạc, ốp lưng)

### Mục đích của dự án
- Hiển thị các sản phẩm công nghệ đẹp, hấp dẫn
- Cho khách hàng xem các chương trình **khuyến mãi, giảm giá**
- Cho khách hàng **đăng ký email** để nhận thông báo khuyến mãi
- Khách hàng có thể **thêm sản phẩm vào giỏ hàng** (mặc dù giỏ hàng chưa hoàn thiện)

---

## 🔄 Cơ chế hoạt động chung

### Quy trình khi khách hàng vào trang web

```
1. Khách hàng mở trang web techstore.com
                    ↓
2. Trang web tải lên (load page) - hiển thị:
   - Header (thanh trên cùng)
   - Menu danh mục sản phẩm
   - Hình ảnh banner quảng cáo
   - Danh sách sản phẩm
   - Form đăng ký email
   - Footer (chân trang)
                    ↓
3. Lúc này, trang web gọi API (yêu cầu dữ liệu) 
   từ server bên ngoài để lấy danh sách sản phẩm
                    ↓
4. Sản phẩm hiển thị lên trang web
                    ↓
5. Khách hàng tương tác:
   - Nhấn vào nút "Thêm vào giỏ"
   - Nhấn vào tab "Apple/Samsung/Oppo"
   - Điền email vào form đăng ký
   - Tìm kiếm sản phẩm
```

---

## 🛠️ Các công nghệ sử dụng

### 1. **React** (Phát triển giao diện)
- **Là cái gì**: Framework (công cụ) để xây dựng trang web
- **Dùng để làm gì**: Tạo giao diện (UI) đẹp, mượt, có thể tương tác
- **Hoạt động như**: Khi bạn bấm nút hoặc cuộn chuột, giao diện sẽ cập nhật tức thì mà không cần tải lại trang

### 2. **Vite** (Công cụ xây dựng)
- **Là cái gì**: Công cụ để chuyển đổi code từ JavaScript hiện đại thành code mà trình duyệt hiểu được
- **Tác dụng**: Giúp trang web chạy nhanh hơn

### 3. **Axios** (Lấy dữ liệu từ server)
- **Là cái gì**: Thư viện giúp gửi yêu cầu tới server để lấy dữ liệu
- **Ví dụ**: Khi trang web mở, nó yêu cầu server: "Hãy cho tôi danh sách sản phẩm"

### 4. **React Router** (Điều hướng trang)
- **Là cái gì**: Công cụ giúp chuyển giữa các trang web
- **Ví dụ**: Khi bạn nhấn liên kết, nó đưa bạn tới trang khác mà không cần tải lại

### 5. **Zustand** (Quản lý trạng thái)
- **Là cái gì**: Thư viện lưu trữ thông tin của ứng dụng
- **Ví dụ**: Lưu thông tin như "người dùng chọn thương hiệu Apple" hoặc "giỏ hàng có 3 sản phẩm"

### 6. **React Hook Form + Zod** (Xử lý form)
- **Là cái gì**: Công cụ để kiểm tra form (ô nhập liệu) có đúng không
- **Ví dụ**: Khi khách hàng nhập email vào form đăng ký, nó kiểm tra xem email có hợp lệ không

### 7. **React Hot Toast** (Thông báo)
- **Là cái gì**: Công cụ để hiển thị thông báo nhỏ ở góc màn hình
- **Ví dụ**: Khi nhấn "Thêm vào giỏ", sẽ có thông báo: "Đã thêm sản phẩm vào giỏ"

---

## 📂 Giải thích từng file quan trọng

### 1️⃣ **src/main.jsx** - Điểm khởi động ứng dụng

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

#### 📝 Giải thích từng dòng

| Dòng | Giải thích |
|------|-----------|
| `import { StrictMode } from 'react'` | Nhập một công cụ từ React để kiểm tra lỗi |
| `import { createRoot } from 'react-dom/client'` | Nhập công cụ để gắn React vào trang HTML |
| `import './index.css'` | Nhập file CSS chứa các kiểu trang trí |
| `import App from './App.jsx'` | Nhập component chính của ứng dụng |
| `createRoot(document.getElementById('root'))` | Tìm phần tử `<div id="root">` trong trang HTML và chuẩn bị gắn React vào đó |
| `.render(...)` | Hiển thị ứng dụng React lên màn hình |

#### 🎯 Tác dụng chung
**File này là cái "công tắc" khởi động toàn bộ ứng dụng.** Khi mở trang web, file này chạy đầu tiên, sau đó chạy file `App.jsx`.

---

### 2️⃣ **src/App.jsx** - Cấu trúc chính của trang web

```javascript
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HomePage } from './features/home/HomePage'
import { SiteHeader } from './components/layout/SiteHeader'
import { SiteFooter } from './shared/layout/SiteFooter'
import { NotFoundPage } from './pages/NotFoundPage'
import { useRouteCategorySync } from './hooks/useRouteCategorySync'
import { useScrollShadow } from './hooks/useScrollShadow'
import './App.css'

function AppShell() {
  useRouteCategorySync()           // Đồng bộ trạng thái menu khi thay đổi trang
  const isScrolled = useScrollShadow()  // Kiểm tra xem đã cuộn xuống chưa

  return (
    <div className="app-shell">
      {/* Hệ thống thông báo */}
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
      
      {/* Header (thanh trên cùng) */}
      <SiteHeader isScrolled={isScrolled} />
      
      {/* Phần chính - nơi hiển thị các trang khác nhau */}
      <main className="app-shell__content">
        <Routes>
          <Route path="/" element={<HomePage />} />  {/* Trang chủ ở đường dẫn "/" */}
          <Route path="*" element={<NotFoundPage />} />  {/* Nếu trang không tìm thấy */}
        </Routes>
      </main>
      
      {/* Footer (chân trang) */}
      <SiteFooter />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>  {/* Bọc toàn bộ ứng dụng để có thể điều hướng trang */}
      <AppShell />
    </BrowserRouter>
  )
}

export default App
```

#### 🏗️ Cấu trúc trang web

```
┌─────────────────────────────────┐
│     SiteHeader (Header)         │  ← Thanh trên cùng với logo, menu, tìm kiếm
├─────────────────────────────────┤
│                                 │
│     HomePage / Trang khác       │  ← Phần nội dung chính
│     (Hiển thị sản phẩm, etc)   │
│                                 │
├─────────────────────────────────┤
│     SiteFooter (Footer)         │  ← Chân trang với thông tin liên hệ, footer
└─────────────────────────────────┘
```

#### 📋 Các phần tử chính

| Phần | Tác dụng |
|------|---------|
| `BrowserRouter` | Cho phép ứng dụng chuyển giữa các trang |
| `Routes` | Định nghĩa các đường dẫn (URL) của trang |
| `Route path="/"` | Khi URL là "/", hiển thị `HomePage` |
| `Route path="*"` | Khi URL không khớp với bất kỳ đường dẫn nào, hiển thị trang lỗi |
| `Toaster` | Hiển thị các thông báo nhỏ (toast) |
| `useScrollShadow()` | Theo dõi xem người dùng có cuộn xuống không để thêm bóng vào header |

---

### 3️⃣ **src/services/homeApi.js** - Gọi API lấy dữ liệu

```javascript
import axios from 'axios'

// Tạo một "đại lý gửi yêu cầu" tới server
const dummyJsonClient = axios.create({
  baseURL: 'https://dummyjson.com',  // Địa chỉ server
  timeout: 10000,                    // Nếu server không phản hồi trong 10 giây, hủy yêu cầu
})

// Hàm 1: Lấy danh sách sản phẩm
export function fetchProducts(params) {
  return dummyJsonClient.get('/products', { params })
  // Gửi yêu cầu GET tới "https://dummyjson.com/products"
}

// Hàm 2: Lấy danh mục sản phẩm
export function fetchProductCategories() {
  return dummyJsonClient.get('/products/categories')
  // Gửi yêu cầu GET tới "https://dummyjson.com/products/categories"
}

// Hàm 3: Tìm kiếm sản phẩm
export function searchProducts(query) {
  return dummyJsonClient.get('/products/search', {
    params: { q: query, limit: 50 }
  })
  // Tìm kiếm sản phẩm theo từ khóa, tối đa 50 kết quả
}

// Hàm 4: Thêm sản phẩm vào giỏ hàng
export function addProductToCart(productId, quantity = 1) {
  return dummyJsonClient.post('/carts/add', {
    userId: 1,
    products: [{ id: Number(productId), quantity }]
  })
  // Gửi POST (yêu cầu tạo dữ liệu mới) để thêm sản phẩm vào giỏ
}

// Hàm 5: Đăng ký newsletter (email)
export function subscribeNewsletter(email) {
  return dummyJsonClient.post('/users/add', {
    firstName: 'Newsletter',
    lastName: 'Subscriber',
    email,
    username: `newsletter_${Math.random().toString(36).slice(2, 10)}`,
    password: 'newsletter123'
  })
  // Gửi email của người dùng tới server để đăng ký
}
```

#### 📡 Giải thích cách gọi API

**API là gì?** API = "Ứng dụng Giao tiếp" (Application Programming Interface)
- **Nó là cách mà trang web yêu cầu dữ liệu từ server**
- Server giống như một nhân viên ở kho hàng, ứng dụng là khách hàng
- Khách hàng gọi: "Cho tôi danh sách sản phẩm điện thoại"
- Nhân viên (server) trả lời: "Dạ, đây là danh sách"

#### Ví dụ cụ thể

**Khi khách hàng mở trang web:**
1. Trang web gọi `fetchProducts()` 
2. Axios gửi yêu cầu: `GET https://dummyjson.com/products?limit=100`
3. Server dummyjson.com trả lại danh sách sản phẩm (dạng JSON)
4. Trang web nhận dữ liệu và hiển thị lên màn hình

**Khi khách hàng nhấn "Thêm vào giỏ":**
1. Trang web gọi `addProductToCart(123, 1)` (sản phẩm ID 123, số lượng 1)
2. Axios gửi yêu cầu: `POST https://dummyjson.com/carts/add` với dữ liệu sản phẩm
3. Server xác nhận và trả lại thông tin giỏ hàng
4. Trang web hiển thị thông báo: "✅ Đã thêm sản phẩm vào giỏ"

---

### 4️⃣ **src/hooks/useHomeContent.js** - Lấy dữ liệu khi mở trang

```javascript
import { useEffect, useState } from 'react'
import { fetchProducts, fetchProductCategories } from '../services/homeApi'
import { filterTechProducts, getRemoteBrands } from '../utils/productMapper'

const DEFAULT_QUERY = {
  limit: 100,              // Lấy 100 sản phẩm
  select: 'id,title,price,discountPercentage,brand,category,thumbnail,images,stock,rating'
  // Chỉ lấy các thông tin quan trọng (không lấy toàn bộ dữ liệu vì quá chậm)
}

const NEXT_QUERY = {
  skip: 100,               // Bỏ qua 100 sản phẩm đầu tiên
  limit: 100,              // Lấy 100 sản phẩm tiếp theo
  select: '...'
}

export function useHomeContent() {
  // state = "trạng thái" - là dữ liệu mà hook lưu trữ
  const [remote, setRemote] = useState({
    products: [],          // Danh sách sản phẩm
    brands: [],            // Danh sách các thương hiệu
    categories: [],        // Danh sách danh mục
    loading: true,         // Đang tải dữ liệu không
    error: null,           // Có lỗi không
  })

  // useEffect = "Khi component được tạo, hãy chạy đoạn code này"
  useEffect(() => {
    let active = true      // Cờ để kiểm tra xem component vẫn còn hay không

    // Gọi 2 API cùng lúc: lấy sản phẩm (2 trang) + danh mục
    Promise.all([
      fetchProducts(DEFAULT_QUERY), 
      fetchProducts(NEXT_QUERY), 
      fetchProductCategories()
    ])
      .then(([firstPageResponse, secondPageResponse, categoriesResponse]) => {
        if (!active) return  // Nếu component đã bị xóa, dừng

        // Trích xuất dữ liệu từ API response
        const firstPageProducts = Array.isArray(firstPageResponse.data?.products) 
          ? firstPageResponse.data.products 
          : []
        const secondPageProducts = Array.isArray(secondPageResponse.data?.products)
          ? secondPageResponse.data.products
          : []
        const categories = Array.isArray(categoriesResponse.data) 
          ? categoriesResponse.data 
          : []

        // Gộp 2 trang sản phẩm lại
        const mergedProducts = mergeProducts(firstPageProducts, secondPageProducts)
        
        // Lọc chỉ lấy sản phẩm công nghệ (điện thoại, đồng hồ, tai nghe, etc)
        const techProducts = filterTechProducts(mergedProducts)

        // Cập nhật state
        setRemote({
          products: techProducts,
          brands: getRemoteBrands(techProducts),  // Trích thương hiệu từ sản phẩm
          categories,
          loading: false,    // Hoàn thành tải dữ liệu
          error: null,       // Không có lỗi
        })
      })
      .catch((error) => {
        // Nếu API gọi bị lỗi
        if (!active) return

        setRemote({
          products: [],
          brands: [],
          categories: [],
          loading: false,
          error,             // Lưu thông tin lỗi
        })
      })

    // Cleanup function: khi component bị xóa, đánh dấu active = false
    return () => {
      active = false
    }
  }, [])  // [] = chỉ chạy 1 lần khi component được tạo

  // Trả lại dữ liệu cho component
  return remote
}

function mergeProducts(firstPage, secondPage) {
  // Gộp 2 mảng sản phẩm thành 1, loại bỏ các sản phẩm trùng lặp
  const productsById = new Map()
  
  ;[...firstPage, ...secondPage].forEach((product) => {
    if (product && typeof product.id !== 'undefined') {
      productsById.set(product.id, product)
    }
  })

  return Array.from(productsById.values())
}
```

#### 🎬 Luồng hoạt động chi tiết

```
1. Component HomePage được tạo
          ↓
2. useHomeContent() được gọi
          ↓
3. Bắt đầu useEffect:
   - Gọi fetchProducts (trang 1) → https://dummyjson.com/products?limit=100
   - Gọi fetchProducts (trang 2) → https://dummyjson.com/products?skip=100&limit=100
   - Gọi fetchProductCategories → https://dummyjson.com/products/categories
          ↓
4. Chờ tất cả API phản hồi (khoảng 1-2 giây)
          ↓
5. Khi nhận được dữ liệu:
   - Gộp sản phẩm từ 2 trang
   - Lọc chỉ lấy sản phẩm công nghệ
   - Trích danh sách thương hiệu
   - Cập nhật state: loading = false
          ↓
6. Component HomePage nhận dữ liệu và hiển thị
```

#### 📊 State của hook

```javascript
// Lúc đầu (đang tải):
{
  products: [],
  brands: [],
  categories: [],
  loading: true,    // ⏳ Đang chờ dữ liệu
  error: null
}

// Lúc hoàn thành:
{
  products: [
    { id: 121, title: 'iPhone 5s', price: 199.99, brand: 'Apple', ... },
    { id: 122, title: 'iPhone 6', price: 299.99, brand: 'Apple', ... },
    { id: 123, title: 'iPhone 13 Pro', price: 1099.99, brand: 'Apple', ... },
    ...
  ],
  brands: ['Apple', 'Samsung', 'Oppo', 'Realme'],
  categories: ['smartphones', 'laptops', 'mens-watches', ...],
  loading: false,   // ✅ Đã xong
  error: null
}

// Nếu lỗi:
{
  products: [],
  brands: [],
  categories: [],
  loading: false,
  error: {          // ❌ Có lỗi (VD: Internet bị cắt)
    message: 'Network Error',
    code: 'ERR_NETWORK'
  }
}
```

---

### 5️⃣ **src/store/useHomeStore.js** - Lưu trữ trạng thái toàn cục

```javascript
import { create } from 'zustand'

// Zustand = thư viện để lưu trữ thông tin ứng dụng
// Giống như một "tòa nhà lưu trữ" - mọi component đều có thể đến lấy/thay đổi dữ liệu

export const useHomeStore = create((set) => ({
  // ==================== STATE ====================
  
  // Thương hiệu được chọn
  selectedBrand: 'Apple',
  
  // Trạng thái menu danh mục (mở hay đóng)
  isCategoryMenuOpen: true,

  // ==================== ACTIONS ====================
  
  // Hàm để thay đổi thương hiệu
  setSelectedBrand: (selectedBrand) => set({ selectedBrand }),
  
  // Hàm để mở menu danh mục
  openCategoryMenu: () => set({ isCategoryMenuOpen: true }),
  
  // Hàm để đóng menu danh mục
  closeCategoryMenu: () => set({ isCategoryMenuOpen: false }),
  
  // Hàm để bật/tắt menu danh mục
  toggleCategoryMenu: () => set((state) => ({ isCategoryMenuOpen: !state.isCategoryMenuOpen })),
}))
```

#### 📝 Cách sử dụng

```javascript
// Trong component bất kỳ:

// Đọc giá trị
const selectedBrand = useHomeStore((state) => state.selectedBrand)  // Lấy: 'Apple'

// Gọi hàm thay đổi
const setSelectedBrand = useHomeStore((state) => state.setSelectedBrand)

// Sử dụng
<button onClick={() => setSelectedBrand('Samsung')}>
  Samsung
</button>
// Khi nhấn nút, tất cả component sử dụng selectedBrand sẽ cập nhật thành 'Samsung'
```

---

### 6️⃣ **src/features/home/HomePage.jsx** - Trang chủ

```javascript
import { useMemo } from 'react'
import { FlashSaleSection } from '../../components/home/FlashSaleSection'
import { useHomeContent } from '../../hooks/useHomeContent'
import { fallbackHeroSlides } from './home.constants'
import { HeroSection } from './sections/HeroSection'
// ... import các section khác

export function HomePage() {
  // Lấy dữ liệu sản phẩm từ API
  const remote = useHomeContent()

  // Xây dựng banner assets (lấy hình ảnh từ sản phẩm)
  const bannerAssets = useMemo(() => buildBannerAssets(remote?.products ?? []), [remote?.products])
  
  // Tạo hero slides (hình ảnh slider ở top)
  const heroSlides = fallbackHeroSlides.map((slide, index) => ({
    ...slide,
    image: bannerAssets.heroImages[index] ?? null,
  }))

  // Lấy dữ liệu từ remote
  const remoteBrands = remote?.brands ?? []
  const remoteProducts = remote?.products ?? []

  return (
    <div className="page-shell">
      <main className="page-main">
        {/* Từng section của trang (phần khác nhau của trang) */}
        <HeroSection heroSlides={heroSlides} remoteProducts={remoteProducts} />
        <ShortcutSection />
        <CouponRowSection />
        <FlashSaleSection products={flashSaleProducts} remoteProducts={remoteProducts} />
        <PhoneShowcaseSection remoteProducts={remoteProducts} remoteBrands={remoteBrands} bannerAssets={bannerAssets} />
        <WatchSection remoteProducts={remoteProducts} watchBannerImage={bannerAssets.watchImage} />
        <AccessorySection remoteProducts={remoteProducts} />
        <AudioSection remoteProducts={remoteProducts} />
        <BrandSection />
        <ArticleSection />
      </main>
    </div>
  )
}
```

#### 🎨 Cấu trúc trang chủ

```
┌─────────────────────────────────┐
│      HeroSection                │  ← Hình slider quảng cáo lớn ở top
├─────────────────────────────────┤
│      ShortcutSection            │  ← Các danh mục nhanh
├─────────────────────────────────┤
│      CouponRowSection           │  ← Các mã giảm giá
├─────────────────────────────────┤
│      FlashSaleSection           │  ← Flash sale (giảm giá nhanh)
├─────────────────────────────────┤
│      PhoneShowcaseSection       │  ← Điện thoại nổi bật
├─────────────────────────────────┤
│      WatchSection               │  ← Đồng hồ thông minh
├─────────────────────────────────┤
│      AccessorySection           │  ← Phụ kiện điện thoại
├─────────────────────────────────┤
│      AudioSection               │  ← Tai nghe, loa
├─────────────────────────────────┤
│      BrandSection               │  ← Logo các thương hiệu
├─────────────────────────────────┤
│      ArticleSection             │  ← Các bài viết tin tức
└─────────────────────────────────┘
```

---

### 7️⃣ **src/components/layout/SiteHeader.jsx** - Header (thanh trên cùng)

```javascript
import { useEffect, useState } from 'react'
import promoBannerImage from '../../assets/TrangChu.png'
import { HeaderTop } from './HeaderTop'
import { SubNav } from './SubNav'

// Component hiển thị banner quảng cáo ở đầu (có nút đóng)
function TopAdStrip() {
  const storageKey = 'techstore-top-ad-dismissed'
  const [isVisible, setIsVisible] = useState(() => {
    // Kiểm tra xem người dùng có đã đóng banner trước đó không (lưu trong localStorage)
    try {
      return window.localStorage.getItem(storageKey) !== '1'
    } catch {
      return true
    }
  })

  useEffect(() => {
    // Khi isVisible thay đổi, lưu vào localStorage
    try {
      window.localStorage.setItem(storageKey, isVisible ? '0' : '1')
    } catch {
      // Nếu không thể lưu (VD: private mode), bỏ qua
    }
  }, [isVisible])

  if (!isVisible) {
    return null  // Nếu đã đóng, không hiển thị gì
  }

  return (
    <div className="top-ad">
      <div className="top-ad__banner">
        <img src={promoBannerImage} alt="Chương trình khuyến mãi Techstore" />
      </div>
      <button type="button" className="top-ad__close" onClick={() => setIsVisible(false)}>
        ×
      </button>
    </div>
  )
}

export function SiteHeader({ isScrolled }) {
  return (
    <>
      <TopAdStrip />                        {/* Banner quảng cáo */}
      <HeaderTop isScrolled={isScrolled} /> {/* Logo, tìm kiếm, giỏ hàng */}
      <SubNav />                            {/* Menu danh mục, hỗ trợ */}
    </>
  )
}
```

#### 🎯 Giải thích

| Phần | Tác dụng |
|------|---------|
| `TopAdStrip` | Banner quảng cáo ở trên cùng (có thể đóng) |
| `HeaderTop` | Thanh chứa logo, tìm kiếm, giỏ hàng |
| `SubNav` | Thanh menu danh mục sản phẩm |
| `isScrolled` | Khi cuộn xuống, thêm bóng vào header |
| `localStorage` | Lưu thông tin ở máy người dùng (VD: banner đã bị đóng chưa) |

---

### 8️⃣ **src/components/NewsletterForm.jsx** - Form đăng ký email

```javascript
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

// Định nghĩa cấu trúc của form (email phải hợp lệ)
const newsletterSchema = z.object({
  email: z.string()
    .trim()                              // Xóa khoảng trắng
    .email('Vui lòng nhập email hợp lệ.') // Phải là email
})

export function NewsletterForm() {
  // Khởi tạo form từ react-hook-form
  const {
    register,                    // Liên kết input với form
    handleSubmit,               // Xử lý khi submit form
    reset,                      // Xóa dữ liệu input sau khi gửi
    formState: { errors, isSubmitting }, // Lỗi và trạng thái gửi
  } = useForm({
    resolver: zodResolver(newsletterSchema),  // Kiểm tra email hợp lệ
    defaultValues: { email: '' },
  })

  const onSubmit = async (values) => {
    // Giả lập gửi email (chờ 250ms)
    await new Promise((resolve) => setTimeout(resolve, 250))
    
    // Hiển thị thông báo thành công
    toast.success(`Đã đăng ký: ${values.email}`)
    
    // Xóa dữ liệu input
    reset()
  }

  return (
    <form className="newsletter__form" onSubmit={handleSubmit(onSubmit)}>
      <label className="sr-only" htmlFor="newsletter-email">
        Email
      </label>
      <Mail size={16} />
      <div className="newsletter__field">
        <input
          id="newsletter-email"
          type="email"
          placeholder="Thả email nhận ngay ưu đãi..."
          aria-invalid={errors.email ? 'true' : 'false'}
          {...register('email')}  {/* Liên kết input với form */}
        />
        {/* Hiển thị lỗi nếu email không hợp lệ */}
        {errors.email ? <span className="newsletter__error">{errors.email.message}</span> : null}
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang gửi...' : 'Đăng ký'}
      </button>
    </form>
  )
}
```

#### 📋 Quy trình khi người dùng điền email

```
1. Người dùng nhập email: "abc@example.com"
          ↓
2. Nhấn nút "Đăng ký"
          ↓
3. Form kiểm tra: email có hợp lệ không?
   - Nếu không (VD: "abc"): hiển thị lỗi "Vui lòng nhập email hợp lệ"
   - Nếu có: tiếp tục
          ↓
4. Gọi onSubmit:
   - Nút bị disable (không thể nhấn lại)
   - Hiển thị "Đang gửi..."
   - Chờ 250ms (giả lập gửi)
          ↓
5. Hiển thị thông báo: "✅ Đã đăng ký: abc@example.com"
          ↓
6. Xóa input (trường email trống)
          ↓
7. Nút kích hoạt lại
```

---

### 9️⃣ **src/shared/ui/ProductCard.jsx** - Thẻ sản phẩm

```javascript
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../utils/currency'

export function ProductCard({ product, compact = false }) {
  // Tạo gradient màu sắc cho background
  const background = Array.isArray(product.accent)
    ? `linear-gradient(135deg, ${product.accent[0]}, ${product.accent[1]})`
    : product.accent

  const handleAddToCart = () => {
    // Hiển thị thông báo khi thêm vào giỏ
    toast.success(`Đã thêm ${product.name} vào giỏ`)
  }

  return (
    <article className={`product-card ${compact ? 'product-card--compact' : ''}`}>
      {/* Phần hình ảnh */}
      <div className={`product-card__art product-card__art--${product.type}`} style={{ background }}>
        {/* Badge (VD: "-50%") */}
        {product.badge ? <span className="product-card__badge">{product.badge}</span> : null}

        {/* Hình ảnh sản phẩm */}
        {product.image ? (
          <div className="product-card__image-wrap">
            <img className="product-card__image" src={product.image} alt={product.name} loading="lazy" />
          </div>
        ) : (
          // Nếu không có hình ảnh, vẽ hình minh họa
          <div className="product-card__device">
            <div className="product-card__glow" />
            <div className="product-card__screen" />
            <div className="product-card__home-indicator" />
          </div>
        )}
      </div>

      {/* Phần thông tin */}
      <div className="product-card__body">
        {/* Tên sản phẩm */}
        <h3>{product.name}</h3>

        {/* Giá và nút thêm vào giỏ */}
        <div className="product-card__price-row">
          <span className="product-card__price">{formatCurrency(product.price)}</span>
          <button type="button" className="product-card__cta" onClick={handleAddToCart}>
            <Plus size={16} />
            Thêm vào giỏ
          </button>
        </div>

        {/* Thông tin thêm (VD: "Trả góp 0%") */}
        {product.perk ?? product.label ? <p className="product-card__perk">{product.perk ?? product.label}</p> : null}
      </div>
    </article>
  )
}
```

#### 🎨 Cấu trúc thẻ sản phẩm

```
┌──────────────────────────────┐
│                              │
│   [Hình ảnh sản phẩm]        │  ← Có thể hiển thị hình ảnh hoặc hình vẽ
│   [-50%]  ← Badge            │
│                              │
├──────────────────────────────┤
│  Tên sản phẩm                │
├──────────────────────────────┤
│  24.490.000đ                 │  ← Giá tiền
│  [Thêm vào giỏ +]            │  ← Nút
├──────────────────────────────┤
│  Trả góp 0%                  │  ← Thông tin thêm
└──────────────────────────────┘
```

---

## 🔗 Luồng hoạt động toàn bộ ứng dụng

### 1. Người dùng mở trang web

```
[Mở browser] 
     ↓
[Tải main.jsx]
     ↓
[Chạy createRoot() - gắn React vào #root element]
     ↓
[Render <App>]
     ↓
[App render <BrowserRouter> + <AppShell>]
     ↓
[AppShell render <SiteHeader> + <Routes> + <SiteFooter>]
     ↓
[<Routes> phù hợp với "/" → render <HomePage>]
     ↓
[HomePage gọi useHomeContent()]
     ↓
[useHomeContent gọi API fetchProducts + fetchProductCategories]
     ↓
[Chờ API phản hồi... (1-2 giây)]
     ↓
[Nhận dữ liệu → lọc → lưu vào state]
     ↓
[Component re-render với dữ liệu thực]
     ↓
[Hiển thị danh sách sản phẩm trên trang]
```

### 2. Người dùng tương tác (VD: nhấn "Thêm vào giỏ")

```
[Nhấn nút "Thêm vào giỏ"]
     ↓
[Gọi handleAddToCart()]
     ↓
[Gọi addProductToCart(productId, quantity)]
     ↓
[API: POST https://dummyjson.com/carts/add]
     ↓
[Chờ server phản hồi]
     ↓
[Hiển thị toast: "✅ Đã thêm vào giỏ"]
```

### 3. Người dùng đăng ký email

```
[Nhập email vào form]
     ↓
[Nhấn "Đăng ký"]
     ↓
[Kiểm tra email hợp lệ (Zod + react-hook-form)]
     ↓
[Nếu lỗi: hiển thị lỗi, dừng]
[Nếu đúng: tiếp tục]
     ↓
[Gọi subscribeNewsletter(email)]
     ↓
[API: POST https://dummyjson.com/users/add]
     ↓
[Hiển thị toast: "✅ Đã đăng ký: abc@example.com"]
     ↓
[Xóa input form]
```

---

## 📚 Từ điển thuật ngữ IT

| Thuật ngữ | Giải thích |
|-----------|-----------|
| **Component** | Một phần của giao diện (VD: Header, Button, Card) |
| **Hook** | Hàm giúp component sử dụng các tính năng của React |
| **State** | Dữ liệu mà component lưu trữ |
| **Props** | Thông tin truyền từ component cha sang component con |
| **API** | Giao diện để lấy dữ liệu từ server |
| **Axios** | Thư viện để gửi yêu cầu HTTP |
| **useEffect** | Hook chạy một đoạn code khi component được tạo/thay đổi |
| **useState** | Hook để lưu trữ dữ liệu trong component |
| **Router** | Quản lý các trang web (URL) |
| **localStorage** | Lưu dữ liệu trên máy người dùng |
| **JSON** | Định dạng dữ liệu (Text đặc biệt) |
| **CSS** | Ngôn ngữ để trang trí giao diện |
| **JSX** | Cách viết code kết hợp JavaScript + HTML |

---

## 🎓 Kết luận

**TechStore** là một ứng dụng web xây dựng bằng **React** với các thành phần chính:

1. **Frontend (Giao diện)**: React + CSS
2. **State Management (Quản lý dữ liệu)**: Zustand, React Hooks
3. **API Communication (Liên lạc server)**: Axios
4. **Routing (Điều hướng)**: React Router
5. **Form Handling (Xử lý form)**: React Hook Form + Zod
6. **Notifications (Thông báo)**: React Hot Toast

**Quy trình chung**: 
- Người dùng mở trang → Gọi API → Nhận dữ liệu → Hiển thị giao diện
- Khi tương tác (nhấn nút, điền form) → Gọi API hoặc cập nhật state → Cập nhật giao diện

---

**Tài liệu này được viết để người hoàn toàn mới có thể hiểu được mã nguồn! 📖**
