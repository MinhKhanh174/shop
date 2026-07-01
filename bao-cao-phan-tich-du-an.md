# Báo cáo phân tích dự án TechStore

## 1. Tổng quan

Dự án hiện tại là một web thương mại điện tử có 2 phần chính:

- **Frontend**: React + Vite + Zustand + React Router.
- **Backend**: Laravel 8, hiện chủ yếu phục vụ luồng gửi email đơn hàng.

Ứng dụng đã có đủ các khối chức năng nền tảng cho một cửa hàng online:

- xem trang chủ, danh mục, sản phẩm
- tìm kiếm, lọc, so sánh, wishlist
- giỏ hàng
- thanh toán
- quản lý tài khoản
- địa chỉ nhận hàng
- lịch sử đơn hàng
- gửi mail xác nhận

Điểm mạnh của dự án là đã có flow mua hàng tương đối đầy đủ và có cơ chế lưu trạng thái bằng localStorage/session/cookie khá rõ ràng. Tuy nhiên, vẫn còn nhiều điểm cần hoàn thiện để dự án có thể đi vào trạng thái ổn định, dễ bảo trì và giống một sản phẩm thật hơn.

---

## 2. Dự án đã có gì

### 2.1 Frontend

- Trang chủ
- Trang danh mục sản phẩm
- Trang chi tiết sản phẩm
- Tìm kiếm sản phẩm
- Giỏ hàng
- Checkout
- Trang yêu thích
- Trang so sánh
- Trang đăng ký, đăng nhập
- Trang hồ sơ cá nhân
- Trang địa chỉ
- Trang lịch sử đơn hàng
- Trang thông báo đặt hàng thành công

### 2.2 Chức năng nghiệp vụ

- Thêm/xóa/cập nhật số lượng sản phẩm trong giỏ
- Lưu giỏ hàng theo người dùng/khách
- Đồng bộ một phần giữa local và remote cart
- Thêm sản phẩm vào wishlist
- So sánh sản phẩm
- Tạo đơn hàng ở phía frontend
- Gửi email xác nhận đơn hàng
- Lưu và chọn địa chỉ nhận hàng
- Tách luồng khách và người dùng đăng nhập

### 2.3 Backend

- Có API gửi mail đơn hàng
- Có mail template riêng
- Có controller xác thực dữ liệu đơn hàng trước khi gửi mail
- Có cấu hình `FRONTEND_URL` để dẫn người dùng về lịch sử đơn hàng

---

## 3. Dự án còn thiếu hoặc chưa hoàn chỉnh

### 3.1 Backend còn rất mỏng

Hiện backend chưa phải là một backend thương mại điện tử đầy đủ. Thiếu các nhóm API quan trọng như:

- quản lý sản phẩm chuẩn hóa
- quản lý danh mục
- quản lý đơn hàng đầy đủ
- quản lý trạng thái đơn hàng
- quản lý tồn kho
- quản lý thanh toán
- quản lý người dùng và vai trò
- quản lý địa chỉ giao hàng phía server

### 3.2 Dữ liệu còn phụ thuộc nhiều vào localStorage

Nhiều phần dữ liệu đang lưu ở trình duyệt:

- giỏ hàng
- wishlist
- địa chỉ
- lịch sử đơn hàng
- so sánh sản phẩm

Điều này giúp làm nhanh, nhưng chưa phù hợp cho hệ thống thực tế vì:

- dễ mất dữ liệu khi đổi máy, đổi trình duyệt, xóa cache
- khó đồng bộ đa thiết bị
- khó quản trị đơn hàng từ backend

### 3.3 Thiếu chuẩn hóa UI/UX

Một số màn hình vẫn cần làm lại để đồng bộ hơn:

- success page sau checkout
- mail template
- form địa chỉ khác
- trạng thái rỗng
- lỗi validation
- loading state
- thông báo thao tác thành công/thất bại

### 3.4 SEO và cấu hình sản phẩm thật chưa mạnh

- `index.html` còn khá tối giản
- chưa thấy meta description, Open Graph, Twitter card
- SPA cần cấu hình rewrite khi deploy
- chưa có sitemap/robots nếu muốn SEO tốt hơn

---

## 4. Những vấn đề cần cải thiện

### 4.1 Kiến trúc dữ liệu

Hiện tại có sự pha trộn giữa:

- dữ liệu local
- dữ liệu mock API
- dữ liệu remote cart
- dữ liệu mail backend

Nên tách rõ hơn thành các lớp:

- domain state
- API service
- persistence layer
- UI layer

### 4.2 Địa chỉ và checkout

Luồng địa chỉ đang cần chuẩn hóa kỹ:

- khi chọn **địa chỉ khác** thì form nên rỗng
- khi chọn **địa chỉ đã lưu** thì mới tự đổ dữ liệu
- phần success page chỉ nên hiển thị địa chỉ cần thiết
- không nên lặp lại tên/số điện thoại ở nhiều nơi nếu đã có block riêng

### 4.3 Đơn hàng và trạng thái sau thanh toán

Sau khi thanh toán xong nên có quy tắc rõ:

- tạo order
- gửi mail
- reset giỏ hàng
- chuyển sang success page
- link sang lịch sử đơn hàng

Hiện luồng này đã có nền tảng, nhưng cần chặt chẽ hơn để tránh:

- giỏ không được xóa
- order hiển thị thiếu dữ liệu
- mail khác với dữ liệu trên UI

### 4.4 Chất lượng mã nguồn

Nên xử lý:

- file không còn dùng
- component re-export vòng trung gian nếu không cần thiết
- lint cấu hình lại để không quét cả `vendor`
- chuẩn hóa encoding tiếng Việt
- tách file quá lớn thành module nhỏ hơn

---

## 5. Lộ trình làm chi tiết

### Giai đoạn 1: Ổn định nền tảng

Mục tiêu:

- làm sạch code
- chuẩn hóa lint/build
- chốt lại cấu trúc dữ liệu

Việc cần làm:

1. Rà soát toàn bộ route và component đang dùng.
2. Dọn file thừa, file re-export không cần thiết.
3. Sửa các lỗi lint thật sự trong code ứng dụng.
4. Loại trừ thư mục `vendor`, `dist`, cache ra khỏi lint.
5. Chuẩn hóa charset, nội dung tiếng Việt.

### Giai đoạn 2: Hoàn thiện checkout

Mục tiêu:

- checkout rõ ràng
- địa chỉ hoạt động đúng
- success page đẹp và đúng nghiệp vụ

Việc cần làm:

1. Khi chọn “địa chỉ khác”, toàn bộ ô dữ liệu phải trống.
2. Khi chọn địa chỉ đã lưu, mới tự điền thông tin.
3. Tách logic hiển thị success page thành component riêng.
4. Reset giỏ hàng ngay sau khi thanh toán thành công.
5. Điều hướng sang lịch sử đơn hàng hoặc success page theo flow thống nhất.

### Giai đoạn 3: Chuẩn hóa email và đơn hàng

Mục tiêu:

- mail khớp UI
- đơn hàng có dữ liệu thống nhất

Việc cần làm:

1. Đồng bộ template email với giao diện success page.
2. Thêm link theo dõi đơn hàng về lịch sử đơn hàng.
3. Kiểm tra lại subject, nội dung, CTA trong mail.
4. Đảm bảo dữ liệu mail lấy từ cùng nguồn với order.

### Giai đoạn 4: Bổ sung backend

Mục tiêu:

- bớt phụ thuộc localStorage
- có dữ liệu thật phía server

Việc cần làm:

1. Tạo API sản phẩm.
2. Tạo API danh mục.
3. Tạo API đơn hàng.
4. Tạo API địa chỉ.
5. Tạo API wishlist/cart nếu cần đồng bộ đa thiết bị.
6. Thiết kế database chuẩn hơn cho order, order_item, address, payment.

### Giai đoạn 5: Nâng chất lượng sản phẩm

Mục tiêu:

- giống dự án thật hơn
- dễ demo và dễ mở rộng

Việc cần làm:

1. Thêm loading skeleton.
2. Thêm empty state đẹp.
3. Thêm toast/error handling thống nhất.
4. Thêm SEO cơ bản.
5. Thêm dashboard admin nếu muốn mở rộng đề tài.

---

## 6. Những phần không nên đụng nhiều

Một số phần hiện tại đang hoạt động ổn, nên giữ ổn định nếu chưa có lý do mạnh để sửa:

- hệ thống route chính
- cấu trúc auth cơ bản
- logic lưu cart hiện tại nếu chưa chuyển sang backend
- mail flow nếu đã gửi được ổn định
- cách tách service/store hiện tại, chỉ refactor dần

---

## 7. Kết luận

Dự án đã có khung rất tốt cho một website bán hàng:

- có đủ luồng người dùng
- có checkout
- có email
- có lịch sử đơn hàng
- có các chức năng hỗ trợ mua sắm

Nhưng để thành một dự án hoàn chỉnh hơn, cần tập trung vào 3 việc chính:

1. **Ổn định logic checkout và địa chỉ**
2. **Đồng bộ UI success page và email**
3. **Nâng backend từ mức “gửi mail” lên “quản lý đơn hàng thật”**

Nếu làm theo lộ trình trên, dự án sẽ từ mức prototype tiến lên mức demo sản phẩm hoàn chỉnh và có khả năng mở rộng tốt hơn.
