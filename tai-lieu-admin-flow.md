# Tài liệu giải thích flow Admin TechStore

Tài liệu này viết theo hướng dễ đọc, mục tiêu là giúp nhìn nhanh được:

- Admin vào bằng route nào
- Mỗi trang trong Admin lấy dữ liệu từ đâu
- Dữ liệu đi qua service nào trước khi lên UI
- Phần nào là dữ liệu thật, phần nào là FE-only, mock, hoặc lưu tạm bằng `localStorage`

Tất cả nội dung dưới đây dựa trên code hiện có trong `src/admin/`.

---

## 1. Tổng quan nhanh về Admin

Admin của TechStore là một khu vực quản trị riêng, tách khỏi storefront của user.

Nó hiện có các trang chính:

- Dashboard
- Products
- Orders
- Users
- Settings

Điểm quan trọng nhất:

- Admin là **FE-only**
- Dữ liệu có thể đi từ **DummyJSON**, **mock data**, hoặc **localStorage**
- Một số thay đổi trong Admin được lưu tạm trên trình duyệt để F5 vẫn còn

---

## 2. Admin được mở như thế nào?

Luồng vào Admin trong `src/App.jsx`:

`/admin`
→ `RequireAdmin`
→ `AdminLayout`
→ các trang con như `dashboard`, `products`, `orders`, `users`, `settings`

### File liên quan

- `src/App.jsx`
- `src/admin/routes/RequireAdmin.jsx`
- `src/admin/layout/AdminLayout.jsx`

### Ý nghĩa từng lớp

#### `RequireAdmin`

Đây là lớp chặn route admin.

Nó kiểm tra:

- có session đăng nhập không
- có token không
- có user không
- user có phải admin không

Nếu không hợp lệ thì:

- chuyển về màn login
- hoặc hiển thị trang từ chối truy cập

#### `AdminLayout`

Đây là khung giao diện chung cho toàn bộ Admin.

Nó bọc:

- sidebar bên trái
- header phía trên
- vùng nội dung chính ở giữa

Nói đơn giản:

`AdminLayout` = khung vỏ của Admin, còn từng page là phần ruột bên trong.

---

## 3. Admin layout gồm những gì?

`src/admin/layout/AdminLayout.jsx` tạo ra bố cục chung:

- `AdminSidebar`
- `AdminHeader`
- vùng nội dung `<Outlet />`

### Sidebar

Sidebar chứa các nhóm menu như:

- Tổng quan
- Quản lý cửa hàng
- Quản lý kho
- Marketing
- Báo cáo
- Cài đặt
- Tài khoản

### Header

Header có các phần cơ bản:

- ô tìm kiếm
- nút thông báo
- menu người dùng
- logout

### Main content

Phần nội dung page được render qua `<Outlet />`.

Tức là khi vào:

- `/admin/dashboard`
- `/admin/products`
- `/admin/orders`
- `/admin/users`
- `/admin/settings`

thì AdminLayout vẫn giữ nguyên, chỉ đổi nội dung trong vùng chính.

---

## 4. Route Admin đi qua file nào?

Trong `src/App.jsx`, route Admin đang được khai báo theo dạng:

`/admin`
→ `RequireAdmin`
→ `AdminLayout`
→ page tương ứng

Các route hiện có:

- `/admin/dashboard`
- `/admin/products`
- `/admin/products/:id`
- `/admin/orders`
- `/admin/orders/:id`
- `/admin/users`
- `/admin/settings`

Nghĩa là:

- Dashboard là trang tổng quan
- Products có cả trang danh sách và trang theo id
- Orders có cả trang danh sách và trang theo id
- Users và Settings là trang riêng

---

## 5. Dữ liệu trong Admin đi theo luồng nào?

Luồng chung trong Admin hiện tại là:

`DummyJSON API / mock data / localStorage`
→ `service`
→ `page`
→ `state`
→ `props`
→ `component`
→ `UI`

Nói dễ hiểu:

1. Service lấy dữ liệu
2. Service chuẩn hóa dữ liệu
3. Page giữ state
4. Page đẩy dữ liệu xuống component con
5. Component chỉ lo hiển thị

---

## 6. Dashboard hoạt động như thế nào?

### File chính

- `src/admin/pages/AdminDashboardPage.jsx`
- `src/admin/services/adminDashboardService.js`

### Dashboard lấy dữ liệu từ đâu?

Dashboard đang gom dữ liệu từ nhiều nguồn:

- DummyJSON products
- DummyJSON users
- DummyJSON carts/orders
- dữ liệu admin đã chuẩn hóa từ các service riêng
- mock dashboard fallback nếu nguồn thật lỗi hoặc rỗng

### Dashboard hiển thị những gì?

- Tổng doanh thu
- Tổng đơn hàng
- Tổng khách hàng
- Sản phẩm sắp hết
- Sản phẩm bán chạy
- Biểu đồ doanh thu
- Biểu đồ trạng thái đơn hàng

### Luồng render của Dashboard

`/admin/dashboard`
→ `App router`
→ `RequireAdmin`
→ `AdminLayout`
→ `AdminDashboardPage`
→ `getDashboardData()`
→ tổng hợp số liệu
→ `stat cards`, `charts`, `top products`, `recent orders`, `low stock`
→ UI hiển thị

### Ghi chú dễ hiểu

- Dashboard không chỉ đọc 1 API duy nhất
- Nó tự ghép dữ liệu từ nhiều service để tạo ra bức tranh tổng quan
- Nếu data thật bị lỗi, dashboard có fallback bằng mock để vẫn render được

---

## 7. Products hoạt động như thế nào?

### File chính

- `src/admin/pages/AdminProductsPage.jsx`
- `src/admin/services/adminProductService.js`
- `src/admin/services/adminProductStorage.js`
- `src/admin/services/dummyJsonAdminApi.js`

### Dữ liệu sản phẩm lấy từ đâu?

Trang Products lấy dữ liệu theo thứ tự:

1. DummyJSON products
2. localStorage overlay của Admin
3. mock fallback nếu cần

### Luồng hiển thị

`/admin/products`
→ `AdminProductsPage`
→ `getProducts()`
→ merge remote products + local products + overrides + deletedIds
→ lọc / tìm kiếm / sắp xếp
→ bảng sản phẩm

### CRUD sản phẩm đang chạy như thế nào?

#### 1. Xem danh sách

`getProducts()`
→ gọi DummyJSON
→ map dữ liệu về shape Admin
→ merge với localStorage
→ trả về danh sách cuối cùng cho page

#### 2. Thêm sản phẩm

`AdminProductsPage`
→ mở modal
→ nhập form
→ bấm lưu
→ `addProduct(payload)`
→ gọi DummyJSON `POST /products/add`
→ normalize dữ liệu
→ lưu vào `localStorage`
→ thêm lên đầu danh sách

#### 3. Sửa sản phẩm

`AdminProductsPage`
→ mở modal sửa
→ sửa dữ liệu
→ bấm lưu
→ `updateProduct(product, payload)`
→ nếu local thì cập nhật localStorage
→ nếu remote thì gọi `PATCH /products/{id}`
→ lưu override vào localStorage
→ cập nhật state bảng

#### 4. Xóa sản phẩm

`AdminProductsPage`
→ mở modal xác nhận
→ bấm xác nhận
→ `deleteProduct(product)`
→ nếu local thì xóa khỏi localStorage
→ nếu remote thì gọi `DELETE /products/{id}`
→ lưu `deletedIds`
→ xóa khỏi state bảng

### localStorage của Admin Products

Key đang dùng:

`techstore_admin_products_v1`

Schema hiện tại có các phần:

- `items`: sản phẩm local do admin thêm mới
- `overrides`: snapshot của sản phẩm remote đã sửa
- `deletedIds`: danh sách id sản phẩm remote đã xóa
- `updatedAt`: thời điểm cập nhật gần nhất

### Ý nghĩa thực tế

- Sản phẩm mới thêm bằng Admin có thể còn sau khi F5
- Sản phẩm remote đã sửa có thể giữ thay đổi sau khi reload
- Sản phẩm remote đã xóa có thể bị ẩn sau khi reload

Tuy nhiên:

- DummyJSON vẫn chỉ là mock API
- phần bền vững thật sự nằm ở `localStorage`

---

## 8. Orders hoạt động như thế nào?

### File chính

- `src/admin/pages/AdminOrdersPage.jsx`
- `src/admin/services/adminOrderService.js`

### Dữ liệu lấy từ đâu?

Orders được dựng từ DummyJSON carts.

Service sẽ:

- đọc carts từ DummyJSON
- map sang shape order của Admin
- ghép label trạng thái, thanh toán, thời gian
- fallback sang mock nếu cần

### Luồng render

`/admin/orders`
→ `AdminOrdersPage`
→ `getOrders()`
→ normalize cart thành order
→ bảng đơn hàng

### Trang chi tiết order

Route `/admin/orders/:id` dùng cùng page Orders, nhưng hiển thị theo đơn cụ thể nếu có id.

---

## 9. Users hoạt động như thế nào?

### File chính

- `src/admin/pages/AdminUsersPage.jsx`
- `src/admin/services/adminUserService.js`

### Dữ liệu lấy từ đâu?

Users cũng lấy từ DummyJSON user API, rồi được map sang shape admin.

### Luồng render

`/admin/users`
→ `AdminUsersPage`
→ `getUsers()`
→ map dữ liệu user
→ bảng user

### Mỗi user có gì?

Thường có:

- tên
- email
- số điện thoại
- role
- status
- avatar
- ngày tạo

Nếu API lỗi thì có mock fallback.

---

## 10. Settings hoạt động như thế nào?

### File chính

- `src/admin/pages/AdminSettingsPage.jsx`

Settings hiện là trang quản trị cấu hình nội bộ của Admin.

Đây là nơi phù hợp cho:

- cấu hình hiển thị
- cài đặt giao diện
- các thiết lập FE-only

Nếu sau này có backend thật, đây cũng là nơi dễ gắn thêm các cài đặt hệ thống.

---

## 11. Admin dùng dữ liệu thật hay mock?

Tóm gọn:

- **Dashboard**: ghép nhiều nguồn thật + fallback mock
- **Products**: DummyJSON + localStorage + mock fallback
- **Orders**: DummyJSON carts + mock fallback
- **Users**: DummyJSON users + mock fallback
- **Settings**: chủ yếu là cấu hình giao diện / FE-only

Nói ngắn gọn:

Admin hiện không phụ thuộc hoàn toàn vào một backend thật.

---

## 12. Luồng dữ liệu FE-only của Admin

Đây là sơ đồ dễ nhớ nhất:

`API / mock / localStorage`
→ `service`
→ `normalize / map`
→ `page state`
→ `table / chart / modal`
→ `UI`

Ví dụ với Products:

`DummyJSON products`
→ `adminProductService`
→ chuẩn hóa về shape chung
→ `AdminProductsPage`
→ state `products`
→ bảng danh sách sản phẩm

Ví dụ với Dashboard:

`DummyJSON products + users + carts`
→ `adminDashboardService`
→ build KPI / chart / top products
→ `AdminDashboardPage`
→ các card và biểu đồ

---

## 13. Phần nào là “thật”, phần nào là “giả lập”?

### Gần với dữ liệu thật hơn

- DummyJSON API
- dữ liệu render từ carts/users/products của DummyJSON

### Giả lập hoặc FE-only

- mock dashboard
- localStorage overlay của admin products
- trạng thái thêm/sửa/xóa trong Admin nếu chưa có backend thật

### Điều cần nhớ

Nếu đang xem trên Admin mà thấy:

- thêm sản phẩm xong vẫn còn sau khi F5
- sửa xong vẫn còn sau khi reload
- xóa xong mất luôn sau khi reload

thì đó là nhờ `localStorage`, không phải do DummyJSON lưu thật.

---

## 14. Các file quan trọng nhất nên nhớ

### Router và khung Admin

- `src/App.jsx`
- `src/admin/routes/RequireAdmin.jsx`
- `src/admin/layout/AdminLayout.jsx`
- `src/admin/layout/AdminSidebar.jsx`
- `src/admin/layout/AdminHeader.jsx`

### Dashboard

- `src/admin/pages/AdminDashboardPage.jsx`
- `src/admin/services/adminDashboardService.js`

### Products

- `src/admin/pages/AdminProductsPage.jsx`
- `src/admin/services/adminProductService.js`
- `src/admin/services/adminProductStorage.js`
- `src/admin/services/dummyJsonAdminApi.js`

### Orders

- `src/admin/pages/AdminOrdersPage.jsx`
- `src/admin/services/adminOrderService.js`

### Users

- `src/admin/pages/AdminUsersPage.jsx`
- `src/admin/services/adminUserService.js`

### Label hiển thị tiếng Việt

- `src/admin/utils/adminDisplayMapper.js`

---

## 15. Kết luận dễ hiểu

Admin của TechStore hiện đi theo mô hình:

- **frontend-first**
- **dữ liệu lấy từ API mock + localStorage**
- **page chỉ giữ UI và state**
- **service lo lấy và chuẩn hóa dữ liệu**
- **layout giữ khung Admin cố định**

Nếu nhìn theo cách rất đơn giản:

1. Người dùng vào `/admin`
2. `RequireAdmin` kiểm tra quyền
3. `AdminLayout` dựng khung Admin
4. Mỗi trang gọi service riêng
5. Service lấy dữ liệu từ DummyJSON / mock / localStorage
6. Page render ra bảng, card, biểu đồ, modal

Đó là toàn bộ flow Admin hiện tại trong repo.
