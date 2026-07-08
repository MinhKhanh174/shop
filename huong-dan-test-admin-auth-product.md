# Hướng dẫn test và truy lỗi Admin / Auth / Product

Tài liệu này dùng để:

- hiểu nhanh flow hiện tại của Admin, Auth và Product
- biết test từng luồng ở đâu
- biết khi lỗi thì nên nhìn file nào trước

Nội dung dựa trên code hiện có trong repo, không giả định backend thật.

---

## 1. Bức tranh tổng quan

TechStore đang chạy theo mô hình frontend-first:

- **Auth**: lưu session ở browser, có cookie + `localStorage`
- **Product storefront**: lấy dữ liệu từ DummyJSON qua service chung
- **Admin**: có layout riêng, route riêng, dữ liệu riêng, nhiều phần còn fallback mock hoặc lưu cục bộ bằng `localStorage`

Luồng chung rất đơn giản:

`route`
→ `page`
→ `service`
→ `normalize / map`
→ `state`
→ `UI`

---

## 2. Auth flow hiện tại

### File cần nhớ

- `src/utils/authStorage.js`
- `src/utils/authBootstrap.js`
- `src/App.jsx`
- `src/features/auth/LoginPage.jsx`
- `src/features/auth/RegisterPage.jsx`
- `src/admin/routes/RequireAdmin.jsx`

### Auth đang lưu ở đâu?

Session auth hiện được lưu bằng 2 lớp:

- `localStorage`
- cookie JSON session

Trong `authStorage.js` có các key chính:

- token auth
- user auth
- session cookie
- registered account

### Luồng đăng nhập

`/dang-nhap`
→ `LoginPage`
→ lưu session bằng `setAuthSession(...)`
→ phát event `techstore:auth-changed`
→ app refresh UI
→ user được coi là đã đăng nhập

### Luồng bảo vệ route user

Các trang tài khoản trong `src/App.jsx` được bọc bằng `RequireAuth`.

Nếu không có session:

- bị đẩy về trang đăng nhập

### Luồng bảo vệ Admin

`/admin`
→ `RequireAdmin`
→ kiểm tra session
→ kiểm tra token
→ kiểm tra role admin
→ nếu hợp lệ thì vào Admin
→ nếu không hợp lệ thì bị chặn

### Logout

Logout ở Admin Layout sẽ:

- xóa session auth
- điều hướng về trang đăng nhập

### Test Auth nhanh

1. Mở trang đăng nhập.
2. Đăng nhập thành công.
3. Kiểm tra session còn trong browser.
4. Reload trang, session phải còn.
5. Mở `/admin`, phải vào được nếu user là admin.
6. Logout, session phải mất.
7. Mở lại trang cần bảo vệ, phải bị đá về login.

---

## 3. Product storefront flow

### File cần nhớ

- `src/services/homeApi.js`
- `src/services/productService.js`
- `src/utils/productMapper.js`
- `src/utils/productRoutes.js`
- `src/features/product/*`
- `src/features/category/*`
- `src/features/home/*`

### Dữ liệu sản phẩm lấy từ đâu?

Storefront hiện lấy sản phẩm từ DummyJSON qua `homeApi.js`.

`productService.js` là lớp map dữ liệu về shape dùng cho UI.

### Luồng dữ liệu sản phẩm

`DummyJSON`
→ `src/services/homeApi.js`
→ `src/services/productService.js`
→ `src/utils/productMapper.js`
→ page storefront
→ card / detail / list UI

### `productService.js` đang làm gì?

- lấy danh sách sản phẩm từ DummyJSON
- chọn các field cần thiết
- convert giá từ đơn vị gốc sang VND bằng cách nhân `25000`
- map title thành name
- gắn ảnh thumbnail
- gắn mô tả, rating, stock, warranty, shipping, return policy, availabilityStatus

### `productMapper.js` đang làm gì?

File này dùng cho card hiển thị ở storefront.

Nó giúp:

- map giá
- map ảnh
- map brand / category
- sinh badge giảm giá
- giữ `source` là object gốc

### `productRoutes.js` đang làm gì?

- chuẩn hóa slug sản phẩm
- sinh link chi tiết sản phẩm
- tìm product theo slug

### Test Product nhanh

1. Mở home hoặc trang danh sách sản phẩm.
2. Kiểm tra sản phẩm có ảnh, tên, giá, rating.
3. Mở trang chi tiết một sản phẩm.
4. Kiểm tra URL slug có đúng không.
5. Kiểm tra giá hiển thị đã convert đúng sang VND.
6. Kiểm tra category và filter có khớp dữ liệu thật.

---

## 4. Admin flow hiện tại

### File chính

- `src/App.jsx`
- `src/admin/routes/RequireAdmin.jsx`
- `src/admin/layout/AdminLayout.jsx`
- `src/admin/layout/AdminSidebar.jsx`
- `src/admin/layout/AdminHeader.jsx`

### Route Admin đi như thế nào?

`/admin`
→ `RequireAdmin`
→ `AdminLayout`
→ page con

Các page chính:

- `/admin/dashboard`
- `/admin/products`
- `/admin/orders`
- `/admin/users`
- `/admin/settings`

### Layout Admin gồm gì?

- sidebar trái
- header trên cùng
- vùng nội dung chính

### Admin có gì đặc biệt?

Admin không chỉ đọc API rồi render.

Nhiều phần đang có:

- DummyJSON
- mock fallback
- `localStorage` overlay
- mapping riêng cho label tiếng Việt

---

## 5. Admin Dashboard flow

### File chính

- `src/admin/pages/AdminDashboardPage.jsx`
- `src/admin/services/adminDashboardService.js`
- `src/admin/data/mockDashboard.js`

### Dashboard lấy dữ liệu từ đâu?

Dashboard gom từ:

- products
- users
- orders/carts

Sau đó service tự tổng hợp:

- tổng doanh thu
- tổng đơn hàng
- tổng khách hàng
- biểu đồ doanh thu
- biểu đồ trạng thái đơn hàng
- top sản phẩm
- sản phẩm sắp hết

### Test Dashboard nhanh

1. Mở `/admin/dashboard`.
2. Kiểm tra các card KPI có số liệu.
3. Kiểm tra biểu đồ có render.
4. Kiểm tra top sản phẩm.
5. Kiểm tra dữ liệu không bị lỗi khi API trả về rỗng hoặc fallback.

---

## 6. Admin Products flow

### File chính

- `src/admin/pages/AdminProductsPage.jsx`
- `src/admin/services/adminProductService.js`
- `src/admin/services/adminProductStorage.js`
- `src/admin/services/dummyJsonAdminApi.js`
- `src/admin/data/mockProducts.js`

### Dữ liệu sản phẩm admin lấy từ đâu?

Thứ tự ưu tiên hiện tại:

1. DummyJSON products
2. `localStorage` overlay của admin
3. mock fallback

### `adminProductService.js` đang làm gì?

- lấy danh sách sản phẩm từ DummyJSON
- normalize về shape Admin
- giữ metadata cho local/remote
- add / update / delete sản phẩm
- lấy danh mục sản phẩm

### `adminProductStorage.js` đang làm gì?

File này là lớp lưu tạm cho Admin Products.

Nó lưu:

- `items`: sản phẩm local do admin thêm
- `overrides`: bản snapshot của sản phẩm remote đã sửa
- `deletedIds`: id sản phẩm remote đã xóa
- `updatedAt`: thời điểm cập nhật gần nhất

Key dùng trong browser:

`techstore_admin_products_v1`

### Flow CRUD Products

#### Thêm

`AdminProductsPage`
→ mở modal
→ nhập form
→ `addProduct(payload)`
→ call DummyJSON `POST /products/add`
→ normalize
→ lưu vào `localStorage`
→ thêm vào state bảng

#### Sửa

`AdminProductsPage`
→ mở modal sửa
→ sửa dữ liệu
→ `updateProduct(product, payload)`
→ nếu local thì update `items`
→ nếu remote thì gọi `PATCH /products/{id}`
→ lưu override vào `localStorage`
→ replace dòng trong state

#### Xóa

`AdminProductsPage`
→ mở modal xác nhận
→ `deleteProduct(product)`
→ nếu local thì xóa khỏi `items`
→ nếu remote thì gọi `DELETE /products/{id}`
→ ghi `deletedIds`
→ xóa khỏi state

### Test Products nhanh

1. Mở `/admin/products`.
2. Kiểm tra danh sách có dữ liệu.
3. Tìm kiếm / lọc / sắp xếp.
4. Thêm một sản phẩm mới.
5. F5 trang, sản phẩm mới phải còn nếu đang được lưu qua `localStorage`.
6. Sửa tên / giá / trạng thái / ảnh.
7. Xóa sản phẩm local và remote.
8. Kiểm tra bảng có cập nhật ngay.

---

## 7. Admin Orders flow

### File chính

- `src/admin/pages/AdminOrdersPage.jsx`
- `src/admin/services/adminOrderService.js`
- `src/admin/data/mockOrders.js`

### Dữ liệu orders lấy từ đâu?

Orders được tạo từ DummyJSON carts.

Service sẽ:

- lấy carts
- ghép thông tin user
- map thành order
- tạo label trạng thái / thanh toán

### Test Orders nhanh

1. Mở `/admin/orders`.
2. Kiểm tra danh sách đơn.
3. Mở chi tiết một đơn.
4. Kiểm tra trạng thái và thanh toán có label đúng.

---

## 8. Admin Users flow

### File chính

- `src/admin/pages/AdminUsersPage.jsx`
- `src/admin/services/adminUserService.js`
- `src/admin/data/mockUsers.js`

### Dữ liệu users lấy từ đâu?

Users lấy từ DummyJSON users API.

Service map ra:

- tên
- email
- phone
- role
- status
- avatar
- createdAt

### Test Users nhanh

1. Mở `/admin/users`.
2. Kiểm tra bảng user.
3. Kiểm tra role và status có label đúng.
4. Tìm kiếm user nếu có.

---

## 9. Các lỗi hay gặp và cách truy nhanh

### 1. Vào `/admin` bị đá về login

Kiểm tra:

- có session không
- token có còn không
- user có role admin không

File cần nhìn:

- `src/admin/routes/RequireAdmin.jsx`
- `src/utils/authStorage.js`

### 2. Login xong nhưng không vào được Admin

Kiểm tra:

- `setAuthSession(...)` có chạy không
- user role có phải `admin` không
- event `techstore:auth-changed` có bắn không

File cần nhìn:

- `src/utils/authStorage.js`
- `src/features/auth/LoginPage.jsx`
- `src/App.jsx`

### 3. Product storefront không hiện đúng giá

Kiểm tra:

- `productService.js` có convert giá chưa
- `productMapper.js` có format priceText đúng chưa

File cần nhìn:

- `src/services/productService.js`
- `src/utils/productMapper.js`

### 4. Admin products thêm/sửa/xóa xong nhưng F5 mất

Kiểm tra:

- `adminProductStorage.js`
- `addProduct`, `updateProduct`, `deleteProduct`
- có ghi đúng vào `techstore_admin_products_v1` không

File cần nhìn:

- `src/admin/services/adminProductStorage.js`
- `src/admin/services/adminProductService.js`

### 5. Dashboard không có đủ số liệu

Kiểm tra:

- `getDashboardData()`
- DummyJSON có trả carts/users/products không
- mock fallback có bị dùng thay không

File cần nhìn:

- `src/admin/services/adminDashboardService.js`
- `src/admin/data/mockDashboard.js`

### 6. Trang chi tiết sản phẩm không mở đúng slug

Kiểm tra:

- `getProductSlug()`
- `normalizeProductSlug()`
- `findProductBySlug()`

File cần nhìn:

- `src/utils/productRoutes.js`

---

## 10. Checklist test nhanh theo từng mảng

### Auth

- đăng nhập được
- logout được
- refresh trang vẫn còn session
- trang account bị chặn khi chưa login
- admin bị chặn nếu không có quyền

### Product storefront

- trang danh sách có sản phẩm
- trang detail mở đúng
- ảnh đúng
- giá đúng
- category đúng
- search / filter chạy được

### Admin

- vào dashboard được
- vào products/orders/users/settings được
- CRUD sản phẩm hoạt động
- dashboard có KPI và chart
- dữ liệu admin không làm hỏng storefront

---

## 11. Cách debug khi gặp lỗi

Nếu cần truy lỗi nhanh, đi theo thứ tự này:

1. **Route**
   - có vào đúng page không
2. **Session**
   - có auth không
3. **Service**
   - dữ liệu từ API/mock/localStorage có về không
4. **Normalize**
   - map field có sai không
5. **State**
   - page có nhận đúng data không
6. **UI**
   - component có render đúng prop không

Đây là thứ tự ít tốn thời gian nhất khi debug.

---

## 12. Kết luận ngắn

Nếu cần hiểu nhanh hệ thống hiện tại, cứ nhớ 3 câu này:

- **Auth** quản lý session và quyền truy cập
- **Product storefront** lấy dữ liệu từ DummyJSON qua service rồi map sang UI
- **Admin** có layout riêng, service riêng, và nhiều phần lưu cục bộ để FE-only vẫn chạy được

Chỉ cần nắm đúng 3 lớp đó là đã debug được phần lớn lỗi hiện tại trong repo.
