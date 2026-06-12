# Báo cáo công việc Techstore

**Thời gian thực hiện:** sáng đến hiện tại, ngày 04/06/2026  
**Phạm vi:** refactor, làm sạch giao diện, kết nối API DummyJSON, chuẩn hoá data và xử lý logic homepage

## 1. Mục tiêu ban đầu

Trong buổi làm việc này, mục tiêu chính là:

- Giữ nguyên flow và giao diện hiện có của homepage.
- Làm sạch kiến trúc source code để dễ bảo trì.
- Kết nối API thật từ DummyJSON cho dữ liệu sản phẩm.
- Đồng bộ các khối banner, danh mục, flash sale, product card.
- Sửa lỗi chữ tiếng Việt hiển thị sai mã hoá.
- Kiểm tra và dọn các phần trùng lặp, dead code, xung đột logic.

---

## 2. Công nghệ và thư viện đang dùng

### Nền tảng chính
- `React`
- `Vite`

### Router
- `react-router-dom`

### Gọi API
- `axios`

### Slider / Carousel
- `swiper`

### Form
- `react-hook-form`
- `@hookform/resolvers`
- `zod`

### State management
- `zustand`

### Icon
- `lucide-react`

### Notification
- `react-hot-toast`

### Styling
- `CSS` hiện tại cho homepage
- `tailwindcss` vẫn có trong dự án, nhưng layout homepage đang ưu tiên CSS hiện có để bám sát ảnh mẫu

---

## 3. So sánh công nghệ và lý do lựa chọn

### 3.1 `react-router-dom` so với tự xử lý route

**Chọn `react-router-dom` vì:**
- Chuẩn phổ biến cho SPA React.
- Dễ tạo route động, fallback, nested route.
- Phù hợp cho homepage + trang 404 hiện tại.

**Không dùng tự xử lý route vì:**
- Dễ rối khi dự án mở rộng.
- Tốn công quản lý state điều hướng thủ công.

### 3.2 `axios` so với `fetch`

**Chọn `axios` vì:**
- Cấu hình dễ hơn.
- Trả về JSON thuận tiện.
- Dễ dùng interceptors, timeout, baseURL.

**Không ưu tiên `fetch` vì:**
- Phải tự xử lý nhiều phần như lỗi, timeout, chuẩn hoá response.

### 3.3 `useEffect` so với `@tanstack/react-query`

**Chọn `useEffect` vì:**
- Dự án hiện tại cần cách fetch đơn giản, rõ ràng.
- Dễ kiểm soát vòng đời request.
- Phù hợp với app đã có data flow đơn giản.

**Không dùng React Query ở giai đoạn này vì:**
- Thêm lớp abstraction chưa cần thiết.
- Mục tiêu là giữ code dễ hiểu và không đổi flow.

### 3.4 `swiper` so với tự code slider

**Chọn `swiper` vì:**
- Hợp với hero slider, brand slider, carousel khuyến mãi.
- Có sẵn navigation, pagination, autoplay.
- Tối ưu trải nghiệm mobile.

**Không tự code slider vì:**
- Dễ sinh bug ở responsive và autoplay.
- Tốn thời gian và khó bảo trì.

### 3.5 `react-hook-form` + `zod` so với `useState` + `yup`

**Chọn `react-hook-form` + `zod` vì:**
- Ít rerender.
- Validation rõ ràng theo schema.
- Dễ mở rộng form về sau.

**Không chọn `yup` vì:**
- `zod` gọn hơn cho schema hiện đại.
- Dễ đồng bộ kiểu dữ liệu.

### 3.6 `zustand` so với `Context API`

**Chọn `zustand` vì:**
- Gọn hơn, ít boilerplate.
- Hợp với state dùng chung như:
  - trạng thái mở/đóng menu danh mục
  - brand đang chọn
- Tránh rerender lan rộng.

**Không dùng `Context API` làm state chính vì:**
- Dễ phình to khi app có nhiều state dùng chung.

### 3.7 `lucide-react` so với bộ icon nặng hơn

**Chọn `lucide-react` vì:**
- SVG gọn, đồng nhất.
- Dễ đổi size, stroke, màu.

### 3.8 `react-hot-toast` so với `react-toastify`

**Chọn `react-hot-toast` vì:**
- Nhẹ.
- Dễ gọi.
- Đủ cho các thông báo nhỏ của ecommerce.

### 3.9 Tailwind CSS so với SCSS

Trong dự án hiện tại, homepage vẫn ưu tiên CSS riêng vì:
- Giao diện đang bám rất sát ảnh mẫu.
- CSS hiện tại dễ siết pixel cho từng khối.

Tailwind vẫn có trong dependencies nhưng chưa phải lớp styling chính của homepage.

---

## 4. Kiến trúc và cấu trúc code

### 4.1 Các lớp chính
- **UI / Component:** các component render giao diện.
- **Logic xử lý:** hook riêng như `useHomeContent`, `useRouteCategorySync`, `useScrollShadow`.
- **API / Service:** `src/services/homeApi.js`.
- **Data / Storage:** `src/data/homeData.js`, `localStorage` cho top banner.
- **Utils / Helpers:** `productMapper`, `bannerSelectors`, `categoryMenuBuilder`, `currency`.
- **Config / Constants:** `home.constants.js`.

### 4.2 Các file chính
- `src/App.jsx`
- `src/features/home/HomePage.jsx`
- `src/components/layout/SiteHeader.jsx`
- `src/components/layout/HeaderTop.jsx`
- `src/components/layout/SubNav.jsx`
- `src/components/layout/CategoryMenu.jsx`
- `src/components/layout/CategoryStrip.jsx`
- `src/components/home/FlashSaleSection.jsx`
- `src/shared/ui/ProductCard.jsx`
- `src/shared/ui/PromoCard.jsx`
- `src/components/NewsletterForm.jsx`
- `src/hooks/useHomeContent.js`
- `src/hooks/useRouteCategorySync.js`
- `src/hooks/useScrollShadow.js`
- `src/services/homeApi.js`
- `src/utils/productMapper.js`
- `src/utils/bannerSelectors.js`
- `src/utils/categoryMenuBuilder.js`

---

## 5. Luồng xử lý tổng thể

### 5.1 Khi app load
1. `App.jsx` bọc `BrowserRouter`.
2. `SiteHeader` được render.
3. `useRouteCategorySync()` đồng bộ trạng thái menu theo route.
4. `useScrollShadow()` bật shadow khi cuộn.
5. `HomePage` fetch dữ liệu từ DummyJSON bằng `useHomeContent()`.

### 5.2 Khi vào homepage
1. Hero slider được dựng từ `fallbackHeroSlides` và ảnh API thật nếu có.
2. Danh mục sản phẩm hiển thị ở cột trái.
3. Thanh “Nổi bật” dùng chung data category nhưng hiển thị theo kiểu icon tròn.
4. Coupon row hiển thị mã giảm giá.
5. Flash sale hiển thị khối nền vàng, countdown, marquee điều kiện và 5 sản phẩm.
6. Khối điện thoại nổi bật, đồng hồ, thương hiệu, bài viết, footer tiếp tục render.

### 5.3 Khi người dùng hover danh mục
1. `CategoryMenu` set category đang active.
2. `buildCategoryMegaGroups()` tạo submenu động từ API.
3. Nhóm nào không có dữ liệu thì không render.
4. Rê chuột ra ngoài thì submenu đóng sau delay ngắn.

---

## 6. Kết nối API DummyJSON

### 6.1 API dùng
- `https://dummyjson.com/products`

### 6.2 Cách gọi
- Sử dụng `axios` trong `src/services/homeApi.js`.
- `useHomeContent()` gọi API khi component mount.
- Query đang dùng:
  - `limit=0`
  - `select=id,title,price,discountPercentage,brand,category,thumbnail`

### 6.3 Cách kiểm tra API kết nối thành công
- Khi fetch thành công, `remote.products` nhận dữ liệu thật.
- `remote.brands` được suy ra từ dữ liệu thật.
- Build/lint pass.
- UI hiển thị ảnh thật thay vì chỉ mock art ở các khối đã được nối.

### 6.4 Cách lọc dữ liệu đúng yêu cầu
DummyJSON có nhiều category ngoài ngành tech.  
Mình đã lọc lại chỉ giữ nhóm công nghệ:

- `smartphones`
- `tablets`
- `laptops`
- `mobile-accessories`
- `mens-watches`
- `womens-watches`
- `headphones`
- `speakers`
- `computer-accessories`

Nhờ vậy homepage không bị lẫn dữ liệu thời trang, đồ gia dụng, skincare, v.v.

### 6.5 Cách lấy đúng dữ liệu cho UI
- `filterTechProducts()` lọc dữ liệu tech.
- `mapApiProductToCard()` đổi shape API sang shape UI.
- `filterProductsBySupportedBrand()` giữ các brand phù hợp với section điện thoại.
- `getRemoteBrands()` lấy brand có thật từ dữ liệu API.

---

## 7. Vì sao lọc và map được đúng dữ liệu

### 7.1 Dữ liệu API không trùng 1:1 với UI
UI Techstore có menu tiếng Việt theo ngành hàng riêng.  
DummyJSON lại có category và brand theo bộ dữ liệu mẫu.

### 7.2 Cách giải quyết
- Tạo lớp `mapper` để map dữ liệu thô sang dữ liệu UI.
- Tạo lớp `builder` để sinh submenu từ dữ liệu thật.
- Tạo lớp `bannerSelectors` để chọn ảnh banner thật phù hợp từng khối.

### 7.3 Tại sao làm vậy
- Không hardcode dữ liệu API vào JSX.
- Không để UI phụ thuộc trực tiếp vào shape thô của response.
- Dễ đổi API sau này mà không phải sửa nhiều component.

---

## 8. Các chức năng đã làm trong buổi sáng

### 8.1 Header
- Logo, search, hotline, hệ thống, tài khoản, giỏ hàng nằm cùng một hàng.
- Thanh trên cùng có banner khuyến mãi và nút đóng.
- Banner đóng được lưu trạng thái trong `localStorage`.

### 8.2 Thanh danh mục / hướng dẫn
- Một hàng ngang duy nhất.
- Nút danh mục đứng bên trái.
- Các link hướng dẫn nằm bên phải.
- Trên homepage menu danh mục mở sẵn và không cho đóng.

### 8.3 Danh mục sản phẩm và mega submenu
- Sidebar danh mục chính dùng chung một nguồn data.
- Hover danh mục con hiển thị panel chi tiết bên phải.
- Dữ liệu submenu lấy từ API thật, nhóm nào không có dữ liệu thì không hiển thị.

### 8.4 Thanh nổi bật
- Dùng chung dữ liệu với danh mục.
- Chỉ đổi kiểu trình bày:
  - icon tròn
  - label phía dưới
  - hàng ngang

### 8.5 Flash sale “Giảm sốc 50%”
- Nền vàng.
- Header campaign + countdown.
- Dòng điều kiện chạy từ phải sang trái.
- 5 card sản phẩm flash sale.

### 8.6 Product card
- Chuẩn hoá cùng một form:
  - ảnh
  - tên
  - giá
  - nút thêm vào giỏ
  - tặng/bảo hành nếu có
- Tối đa 5 sản phẩm mỗi hàng trên desktop.

### 8.7 Banner ảnh thật từ API
- Hero banner lớn.
- 3 banner nhỏ bên dưới.
- Banner đồng hồ.
- Ảnh được chọn theo brand/title để sát hơn với mẫu.

### 8.8 Form newsletter
- Dùng `react-hook-form` + `zod`.
- Validate email.
- Toast khi submit.

---

## 9. Logic lựa chọn ảnh banner

### 9.1 Mục tiêu
Thay mock art bằng ảnh thật từ API nhưng vẫn giữ layout hiện tại.

### 9.2 Cách làm
- Tạo `buildBannerAssets()` trong `src/utils/bannerSelectors.js`.
- Ưu tiên chọn ảnh theo:
  - brand
  - title pattern
  - category

### 9.3 Quy tắc chọn
- Hero:
  - ưu tiên Samsung / Apple / Oppo / Xiaomi
- 3 banner nhỏ:
  - banner 1: Apple
  - banner 2: Samsung
  - banner 3: Oppo, nếu không có thì Xiaomi
- Watch banner:
  - ưu tiên sản phẩm watch thật

### 9.4 Vì sao làm được
DummyJSON có sẵn `thumbnail` và `images[]` cho từng sản phẩm.
Chỉ cần map đúng sản phẩm tech và chọn ảnh phù hợp.

---

## 10. Tổng hợp kiểm tra kỹ thuật

### 10.1 Kiểm tra lint
- Chạy `npm.cmd run lint`
- Kết quả: pass

### 10.2 Kiểm tra build
- Chạy `npm.cmd run build`
- Kết quả: pass
- Có cảnh báo chunk > 500 kB của Vite, nhưng không phải lỗi chạy

### 10.3 Kiểm tra API
- Đã xác nhận endpoint `/products` hoạt động.
- Dữ liệu trả về có `products`, `total`, `skip`, `limit`.
- Có thể dùng `limit=0` để lấy toàn bộ sản phẩm.

---

## 11. Các điểm đã dọn sạch trong source

- Xoá khối menu hardcode cũ không còn dùng.
- Tách header thành component rõ ràng.
- Tách logic fetch, scroll shadow, route sync ra hooks riêng.
- Tách submenu builder ra util riêng.
- Chuẩn hoá product card và flash sale card.
- Sửa lỗi chữ tiếng Việt hiển thị sai.

---

## 12. Kết luận

Buổi làm việc sáng giờ tập trung vào 4 mảng chính:

1. **Làm sạch kiến trúc**  
   Tách component, hook, utils, service, data rõ ràng.

2. **Kết nối API thật**  
   Lấy dữ liệu từ DummyJSON, lọc chỉ còn tech products.

3. **Đồng bộ giao diện**  
   Giữ flow cũ nhưng chuẩn hoá card, banner, menu, flash sale, newsletter.

4. **Khôi phục tiếng Việt chuẩn**  
   Sửa các chuỗi UI bị lỗi mã hoá để giao diện hiển thị đúng.

Nếu cần làm tiếp, bước phù hợp nhất sau báo cáo này là:
- tối ưu bundle size Vite,
- hoặc tách thêm các section homepage để code gọn hơn nữa.
