# 📚 HƯỚNG DẪN CHI TIẾT - PHẦN 3: CẤU HÌNH & DỮ LIỆU

## 📌 Mục lục
1. [File cấu hình](#file-cấu-hình)
2. [File dữ liệu tĩnh](#file-dữ-liệu-tĩnh)
3. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
4. [Cách chạy dự án](#cách-chạy-dự-án)

---

## ⚙️ File cấu hình

### 1️⃣ **package.json** - Khai báo thư viện & lệnh

```json
{
  "name": "techstore",                // Tên dự án
  "private": true,                    // Không public lên npm
  "version": "0.0.0",                 // Phiên bản (mới nhất)
  "type": "module",                   // Dùng ES6 modules (import/export)
  
  // Lệnh để chạy dự án
  "scripts": {
    "dev": "vite",                    // npm run dev → Chạy chế độ phát triển
    "build": "vite build",            // npm run build → Xây dựng file sản phẩm
    "lint": "eslint .",               // npm run lint → Kiểm tra lỗi code
    "preview": "vite preview"         // npm run preview → Xem preview sản phẩm
  },

  // Thư viện cần thiết (khi chạy npm install)
  "dependencies": {
    "@hookform/resolvers": "^5.4.0",  // Kết nối React Hook Form với Zod
    "axios": "^1.17.0",                // Gọi API
    "lucide-react": "^1.17.0",         // Icon SVG
    "react": "^19.2.6",                // Framework UI
    "react-dom": "^19.2.6",            // Render React vào HTML
    "react-hook-form": "^7.77.0",     // Quản lý form
    "react-hot-toast": "^2.6.0",       // Hiển thị toast notification
    "react-router-dom": "^7.16.0",     // Điều hướng trang
    "swiper": "^12.2.0",               // Slider/carousel
    "zod": "^4.4.3",                   // Kiểm tra dữ liệu form
    "zustand": "^5.0.14"               // State management
  },

  // Thư viện chỉ dùng khi phát triển (không cần cho sản phẩm cuối cùng)
  "devDependencies": {
    "@eslint/js": "^10.0.1",           // Kiểm tra code style
    "@tailwindcss/postcss": "^4.3.0",  // Tailwind CSS (cài nhưng không dùng)
    "@types/react": "^19.2.14",        // Type definitions cho React
    "@types/react-dom": "^19.2.3",     // Type definitions cho React DOM
    "@vitejs/plugin-react": "^6.0.1",  // Plugin React cho Vite
    "autoprefixer": "^10.5.0",         // CSS vendor prefixes
    "eslint": "^10.3.0",               // Linter (kiểm tra code)
    "eslint-plugin-react-hooks": "^7.1.1",  // Kiểm tra rules cho React Hooks
    "eslint-plugin-react-refresh": "^0.5.2", // Kiểm tra Hot Module Replacement
    "globals": "^17.6.0",              // Global variables như process, window
    "postcss": "^8.5.15",              // CSS processor
    "tailwindcss": "^4.3.0",           // CSS framework (cài nhưng không dùng)
    "vite": "^8.0.12"                  // Build tool
  }
}
```

#### 📝 Giải thích lệnh npm

```bash
# Cài đặt thư viện (chạy 1 lần khi clone dự án)
npm install
# → Tạo thư mục node_modules chứa tất cả thư viện

# Chạy chế độ phát triển (phát triển app)
npm run dev
# → Mở http://localhost:5173
# → Code thay đổi → tự động reload (hot reload)

# Xây dựng (tạo file sản phẩm để deploy)
npm run build
# → Tạo thư mục "dist/" chứa file HTML/CSS/JS đã nén

# Kiểm tra lỗi code
npm run lint
# → Báo cáo các dòng code không theo style guide

# Xem preview sản phẩm
npm run preview
# → Xem sản phẩm cuối cùng trên http://localhost:4173
```

#### 🎯 Khi nào dùng thư viện nào?

| Thư viện | Khi nào dùng | Ví dụ |
|----------|-------------|--------|
| **React** | Tạo component & giao diện | `<div>Hello</div>` |
| **Axios** | Gọi API lấy dữ liệu | `fetchProducts()` |
| **React Router** | Chuyển giữa các trang | `/` → HomePage, `/404` → NotFoundPage |
| **Zustand** | Chia sẻ dữ liệu giữa component | Chọn brand → lưu vào store |
| **React Hook Form** | Quản lý form | Xử lý form đăng ký email |
| **Zod** | Kiểm tra dữ liệu form | Email phải hợp lệ |
| **React Hot Toast** | Hiển thị thông báo | "✅ Đã thêm vào giỏ" |
| **Swiper** | Tạo slider | Banner quảng cáo tự động quay |
| **Lucide React** | Icon SVG | Biểu tượng menu, tìm kiếm, v.v. |

---

### 2️⃣ **vite.config.js** - Cấu hình build tool

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// defineConfig = định nghĩa cấu hình Vite
export default defineConfig({
  plugins: [react()],  // Sử dụng plugin React cho Vite
})
```

#### 📝 Giải thích

| Phần | Tác dụng |
|------|---------|
| `defineConfig()` | Hàm để cấu hình Vite |
| `plugins` | Danh sách các plugin (công cụ mở rộng) |
| `react()` | Plugin React - giúp Vite hiểu file `.jsx` |

#### 🎯 Vite là gì?

- **Là gì**: Build tool (công cụ xây dựng) - chuyển code phức tạp thành code trình duyệt hiểu được
- **Lợi ích**: 
  - Chạy nhanh (Hot Module Replacement)
  - Cây được file nhỏ gọn (production)
  - Cấu hình đơn giản

---

### 3️⃣ **index.html** - Trang HTML chính

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />                                    <!-- Mã ký tự UTF-8 -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" /> <!-- Icon tab -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <!-- Responsive -->
    <title>techstore</title>                                    <!-- Tên tab -->
  </head>
  <body>
    <div id="root"></div>                                        <!-- Chỗ gắn React vào -->
    <script type="module" src="/src/main.jsx"></script>          <!-- Chạy file main.jsx -->
  </body>
</html>
```

#### 🔍 Quá trình khởi động

```
1. Browser mở index.html
          ↓
2. Hiển thị <div id="root"></div> (trống)
          ↓
3. Tải file main.jsx (JavaScript)
          ↓
4. main.jsx tạo React app
          ↓
5. React app được gắn vào <div id="root"></div>
          ↓
6. Hiển thị giao diện hoàn chỉnh
```

---

### 4️⃣ **eslint.config.js** - Kiểm tra code style

```javascript
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },  // Không kiểm tra thư mục dist/
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
```

#### 📝 Tác dụng

**ESLint = "Cảnh sát code"** - Kiểm tra code có lỗi không

**Các quy tắc kiểm tra:**
- ✅ Biến không dùng → Báo lỗi
- ✅ Hook không đúng thứ tự → Báo lỗi
- ✅ Component không export → Báo lỗi

**Chạy kiểm tra:**
```bash
npm run lint
# → Báo danh sách các lỗi
```

---

## 📦 File dữ liệu tĩnh

### 1️⃣ **src/data/homeData.js** - Dữ liệu mặc định (Fallback)

**Tác dụng**: Cung cấp dữ liệu tĩnh khi API không hoạt động

```javascript
// ==================== TOP ACTIONS ====================
export const topActions = [
  { id: 'phone', label: 'Gọi mua hàng', value: '19006750', iconKey: 'phone' },
  { id: 'store', label: 'Hệ thống', value: 'cửa hàng', iconKey: 'map-pin' },
  { id: 'account', label: 'Tài khoản', value: 'Đăng nhập', iconKey: 'user' },
]
// Dùng: HeaderTop component (thanh trên cùng)

// ==================== SUPPORT LINKS ====================
export const supportLinks = [
  { label: 'Hướng dẫn bán máy cũ', icon: Smartphone },
  { label: 'Hướng dẫn mua online', icon: ShoppingCart },
  { label: 'Hướng dẫn trả góp', icon: CreditCard },
]
// Dùng: SubNav component (menu hỗ trợ)

// ==================== CATEGORY ITEMS ====================
export const categoryItems = [
  {
    key: 'featured',
    sidebarLabel: 'Tổng hợp khuyến mãi',  // Label bên cạnh
    stripLabel: 'Nổi bật',                // Label ở top strip
    icon: Gift,                            // Icon (từ lucide-react)
    href: '#hero',                         // Đường dẫn (đi tới #hero id)
    tone: ['#5b6dff', '#ff6ea8'],          // Màu gradient
    isHot: true,                           // Có "HOT" badge không
    showInStrip: true,                     // Hiển thị ở top strip không
  },
  // ... thêm các category khác
]
// Dùng: CategoryMenu, CategoryStrip

// ==================== COUPONS ====================
export const coupons = [
  {
    code: 'EGA50',
    title: 'NHẬP MÃ: EGA50',
    description: 'Giảm 50% cho đơn hàng tối thiểu 500K',
    condition: 'Điều kiện',
  },
  // ... thêm các coupon khác
]
// Dùng: CouponRowSection

// ==================== SAMPLE PRODUCTS ====================
export const flashSaleProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    price: 35990000,
    oldPrice: 36990000,
    badge: '-3%',
    image: 'https://...',
    brand: 'Apple',
  },
  // ... thêm sản phẩm khác
]
// Dùng: FlashSaleSection (fallback nếu API không có dữ liệu)

// ==================== FOOTER CONTENT ====================
export const footerColumns = [
  {
    title: 'Thông tin công ty',
    links: [
      { label: 'Về chúng tôi', href: '#' },
      { label: 'Chính sách bảo mật', href: '#' },
      // ...
    ],
  },
  // ... thêm footer columns khác
]
// Dùng: SiteFooter
```

#### 🎯 Cấu trúc dữ liệu

```javascript
// Mỗi object thường có:
{
  id: 1,                              // ID duy nhất
  name: 'Tên sản phẩm',
  label: 'Nhãn',
  href: 'https://...',               // Liên kết
  icon: SomeIcon,                    // Icon component
  tone: ['#color1', '#color2'],      // Màu sắc
  description: 'Mô tả',
  price: 1000000,                    // Giá
  isActive: true,                    // Trạng thái
}
```

---

## 🗂️ Cấu trúc thư mục

```
techstore/
├── 📄 package.json                ← Khai báo thư viện
├── 📄 vite.config.js              ← Cấu hình Vite
├── 📄 eslint.config.js            ← Cấu hình ESLint
├── 📄 index.html                  ← HTML chính
├── 📄 README.md                   ← Giới thiệu dự án
├── 📄 HUONG_DAN_CHI_TIET_CHO_NGUOI_MOI.md    ← Tài liệu này
├── 📁 public/
│   ├── 📁 mock/
│   │   └── 📄 home.json           ← Dữ liệu mock (không dùng)
│   └── 📄 favicon.svg             ← Icon tab
├── 📁 src/
│   ├── 📄 main.jsx                ← Điểm khởi động
│   ├── 📄 App.jsx                 ← Component chính
│   ├── 📄 index.css               ← CSS toàn cộng
│   ├── 📄 App.css                 ← CSS của App
│   ├── 📁 components/             ← Component UI nhỏ
│   │   ├── 📁 home/
│   │   │   └── 📄 FlashSaleSection.jsx
│   │   ├── 📁 layout/
│   │   │   ├── 📄 SiteHeader.jsx
│   │   │   ├── 📄 HeaderTop.jsx
│   │   │   ├── 📄 SearchBar.jsx
│   │   │   ├── 📄 SubNav.jsx
│   │   │   ├── 📄 CategoryMenu.jsx
│   │   │   └── 📄 CategoryStrip.jsx
│   │   └── 📄 NewsletterForm.jsx
│   ├── 📁 features/               ← Feature components (lớn hơn)
│   │   └── 📁 home/
│   │       ├── 📄 HomePage.jsx    ← Trang chủ
│   │       ├── 📄 home.constants.js
│   │       └── 📁 sections/
│   │           ├── 📄 HeroSection.jsx
│   │           ├── 📄 PhoneShowcaseSection.jsx
│   │           ├── 📄 WatchSection.jsx
│   │           ├── 📄 AccessorySection.jsx
│   │           ├── 📄 AudioSection.jsx
│   │           ├── 📄 BrandSection.jsx
│   │           ├── 📄 ArticleSection.jsx
│   │           ├── 📄 ShortcutSection.jsx
│   │           └── 📄 CouponRowSection.jsx
│   ├── 📁 hooks/                  ← Custom Hooks
│   │   ├── 📄 useHomeContent.js  ← Lấy dữ liệu API
│   │   ├── 📄 useScrollShadow.js
│   │   └── 📄 useRouteCategorySync.js
│   ├── 📁 services/               ← API calls
│   │   └── 📄 homeApi.js         ← Gọi DummyJSON API
│   ├── 📁 store/                  ← State management (Zustand)
│   │   └── 📄 useHomeStore.js
│   ├── 📁 utils/                  ← Utility functions
│   │   ├── 📄 productMapper.js   ← Chuyển đổi sản phẩm
│   │   ├── 📄 currency.js        ← Định dạng tiền tệ
│   │   ├── 📄 bannerSelectors.js
│   │   ├── 📄 categoryMenuBuilder.js
│   │   └── 📄 articleThumb.js
│   ├── 📁 data/                   ← Dữ liệu tĩnh
│   │   └── 📄 homeData.js
│   ├── 📁 pages/                  ← Page components
│   │   └── 📄 NotFoundPage.jsx   ← Trang 404
│   ├── 📁 shared/                 ← Shared components
│   │   ├── 📁 layout/
│   │   │   └── 📄 SiteFooter.jsx
│   │   └── 📁 ui/
│   │       ├── 📄 ProductCard.jsx
│   │       ├── 📄 PromoCard.jsx
│   │       └── 📄 SectionHeading.jsx
│   └── 📁 assets/                 ← Hình ảnh, icon
│       └── 📄 (các file hình ảnh)
└── 📁 node_modules/               ← Thư viện (tạo khi npm install)
    └── (tất cả thư viện)
```

#### 🎯 Giải thích cấu trúc

| Thư mục | Tác dụng |
|---------|---------|
| `src/components/` | UI component nhỏ (Header, Menu, Form) |
| `src/features/` | Page component lớn hơn (HomePage) |
| `src/hooks/` | Custom Hooks (Logic tái sử dụng) |
| `src/services/` | API client (gọi server) |
| `src/store/` | State management (Zustand) |
| `src/utils/` | Utility functions (không phải React) |
| `src/data/` | Dữ liệu tĩnh (fallback) |
| `src/pages/` | Page components (toàn trang) |
| `src/shared/` | Shared components (cùng dùng nhiều nơi) |

---

## 🚀 Cách chạy dự án

### 1️⃣ **Lần đầu tiên**

```bash
# 1. Clone/tải dự án
git clone <url-dự-án>
cd techstore

# 2. Cài đặt thư viện
npm install
# → Tạo node_modules/ (chờ 1-2 phút)

# 3. Chạy chế độ phát triển
npm run dev
# → Mở http://localhost:5173 tự động
```

### 2️⃣ **Lần tiếp theo**

```bash
# Chỉ cần chạy (không cần npm install lại)
npm run dev
# → http://localhost:5173
```

### 3️⃣ **Tạo sản phẩm để deploy**

```bash
# Build
npm run build
# → Tạo thư mục dist/ chứa file sản phẩm

# Xem preview
npm run preview
# → http://localhost:4173
```

### 4️⃣ **Kiểm tra lỗi code**

```bash
npm run lint
# → Danh sách các lỗi code style
```

---

## 📊 Luồng dữ liệu toàn bộ ứng dụng

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (Trình duyệt người dùng)           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Mở http://localhost:5173                           │
│     ↓                                                   │
│  2. Tải index.html                                     │
│     ↓                                                   │
│  3. Tải main.jsx → React app                           │
│     ↓                                                   │
│  4. App.jsx → AppShell → HomePage                      │
│     ↓                                                   │
│  5. HomePage → useHomeContent()                        │
│     ↓                                                   │
│  6. useHomeContent gọi API:                            │
│     → fetchProducts (page 1)                           │
│     → fetchProducts (page 2)                           │
│     → fetchProductCategories                          │
│     ↓                                                   │
└─────────────────────────────────────────────────────────┘
         ↓ (HTTP Request)
┌─────────────────────────────────────────────────────────┐
│              BACKEND (dummyjson.com)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  GET /products?limit=100                               │
│  → Trả lại: { products: [...194 items...] }           │
│                                                         │
│  GET /products?skip=100&limit=100                      │
│  → Trả lại: { products: [...100 items...] }           │
│                                                         │
│  GET /products/categories                              │
│  → Trả lại: ["smartphones", "tablets", ...]           │
│                                                         │
└─────────────────────────────────────────────────────────┘
         ↓ (HTTP Response)
┌─────────────────────────────────────────────────────────┐
│              FRONTEND - Xử lý dữ liệu                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  7. Nhận JSON từ API                                   │
│     ↓                                                   │
│  8. Gộp 2 trang sản phẩm:                              │
│     productA + productB = [...194 items merged...]    │
│     ↓                                                   │
│  9. Lọc công nghệ: [...60 tech items...]              │
│     ↓                                                   │
│  10. Ánh xạ đổi API format → UI format                  │
│     { id, title, price, ... } → { id, name, price, ...}│
│     ↓                                                   │
│  11. Cập nhật state (Zustand store):                    │
│     setRemote({ products: [...], loading: false })    │
│     ↓                                                   │
│  12. Component re-render với dữ liệu mới              │
│     HomePage → PhoneShowcaseSection, WatchSection, ...│
│     ↓                                                   │
│  13. Hiển thị giao diện hoàn chỉnh trên màn hình      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Các tình huống thường gặp

### 🔴 Tình huống 1: Trang web hiển thị trống

**Nguyên nhân có thể:**
1. API không hoạt động (internet bị cắt)
2. Build lỗi
3. Quên npm install

**Cách khắc phục:**
```bash
# 1. Xóa node_modules và cài lại
rm -r node_modules package-lock.json
npm install

# 2. Xóa cache Vite
rm -r .vite

# 3. Chạy lại
npm run dev
```

### 🟡 Tình huống 2: Toast notification không hiện

**Nguyên nhân:** Toaster chưa được render trong App.jsx

**Khắc phục:** Thêm `<Toaster />` vào App.jsx

```javascript
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <>
      <Toaster position="top-right" />  ← Thêm dòng này
      {/* ... */}
    </>
  )
}
```

### 🟢 Tình huống 3: Sản phẩm không hiển thị

**Nguyên nhân:** API có dữ liệu nhưng component chưa xử lý

**Khắc phục:** Kiểm tra filter/mapping logic

```javascript
// Thêm debug log
console.log('remoteProducts:', remoteProducts)
console.log('filtered:', filtered)

// Hoặc hiển thị thông báo
{displayProducts.length === 0 && <p>Không có sản phẩm</p>}
```

---

## 🎓 Tóm tắt các kiến thức quan trọng

### ✅ Những gì bạn cần biết

1. **Cấu trúc React Component**
   - Component = Function trả về JSX
   - Props = Thông tin từ component cha
   - State = Dữ liệu thay đổi của component

2. **Hooks chính**
   - `useState` - Lưu trữ dữ liệu
   - `useEffect` - Chạy code khi component tạo/cập nhật
   - `useCallback` - Memoize function

3. **Gọi API**
   - Axios = HTTP client
   - Async/await = Chờ API phản hồi
   - Toast = Hiển thị kết quả

4. **State Management**
   - Zustand = Thư viện store đơn giản
   - useHomeStore = Hook để lấy/thay đổi state

5. **Form Handling**
   - React Hook Form = Quản lý form
   - Zod = Kiểm tra dữ liệu
   - Combine = Form validation mạnh

### ❌ Những lỗi thường gặp

1. ❌ Quên return JSX trong component
2. ❌ Gọi hook bên ngoài component
3. ❌ Quên dependency array trong useEffect
4. ❌ Thay đổi state trực tiếp (phải dùng setState)
5. ❌ Gọi async function trong useEffect mà không await

### ✨ Best practices

1. ✅ Tách component nhỏ (Single Responsibility)
2. ✅ Dùng custom hooks để tái sử dụng logic
3. ✅ Dùng constants thay vì hardcode
4. ✅ Thêm comments cho code phức tạp
5. ✅ Kiểm tra lỗi (error handling) khi gọi API

---

## 📚 Tài liệu tham khảo

### Thư viện chính
- **React**: https://react.dev
- **React Router**: https://reactrouter.com
- **Axios**: https://axios-http.com
- **Zustand**: https://zustand-demo.vercel.app
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev

### API
- **DummyJSON**: https://dummyjson.com

### Tools
- **Vite**: https://vitejs.dev
- **ESLint**: https://eslint.org
- **Lucide React**: https://lucide.dev

---

**🎉 Chúc mừng! Bạn đã hiểu rõ toàn bộ dự án TechStore!**

---

## 📝 Câu hỏi thường gặp (FAQ)

### **Q: Tại sao phải có 2 page API?**
A: Vì DummyJSON chỉ trả 194 sản phẩm, và sản phẩm công nghệ (smartphones, watches) nằm ở trang 2. Nên phải lấy cả 2 trang để đủ dữ liệu.

### **Q: Làm sao thêm sản phẩm mới?**
A: 
1. Thêm vào `homeData.js` (dữ liệu tĩnh)
2. Hoặc sửa API backend để trả sản phẩm mới
3. Component sẽ tự động lấy và hiển thị

### **Q: Tại sao dùng Zustand thay vì Context?**
A: Zustand nhẹ hơn, dễ dùng hơn, và không gây re-render toàn bộ app.

### **Q: Làm sao để hiển thị thêm trang?**
A: 
1. Tạo component mới (VD: ProductDetailPage)
2. Thêm Route trong App.jsx: `<Route path="/product/:id" element={<ProductDetailPage />} />`
3. Tạo link tới trang: `<Link to="/product/123">Chi tiết</Link>`

### **Q: Tại sao lỗi "Cannot read property of undefined"?**
A: Dữ liệu chưa tải xong. Kiểm tra bằng:
```javascript
{products && products.length > 0 ? (
  // Hiển thị
) : (
  <p>Đang tải...</p>
)}
```

### **Q: Làm sao deploy lên website?**
A:
1. `npm run build` → tạo `dist/` folder
2. Upload `dist/` folder lên hosting (Vercel, Netlify, etc)
3. Domain tự động trỏ tới index.html

---

