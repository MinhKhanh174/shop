import { CreditCard, Smartphone, ShoppingCart } from 'lucide-react'
import { ROUTES } from '../config/routes'

export const topActions = [
  { id: 'phone', label: 'Gọi mua hàng', value: '19006750', iconKey: 'phone' },
  { id: 'store', label: 'Hệ thống', value: 'cửa hàng', iconKey: 'map-pin' },
  {
    id: 'account',
    label: 'Tài khoản',
    iconKey: 'user',
    links: [
      { label: 'Đăng nhập', to: ROUTES.LOGIN },
    ],
  },
]

export const supportLinks = [
  { label: 'Hướng dẫn bán máy cũ', icon: Smartphone },
  { label: 'Hướng dẫn mua online', icon: ShoppingCart },
  { label: 'Hướng dẫn trả góp', icon: CreditCard },
]

export const coupons = [
  {
    code: 'EGA50',
    title: 'NHẬP MÃ: EGA50',
    description: 'Giảm 50% cho đơn hàng tối thiểu 500K',
    condition: 'Điều kiện',
  },
  {
    code: 'EGA15',
    title: 'NHẬP MÃ: EGA15',
    description: 'Giảm 15% cho đơn hàng tối thiểu 500K',
    condition: 'Điều kiện',
  },
  {
    code: 'EGA99K',
    title: 'NHẬP MÃ: EGA99K',
    description: 'Giảm 99K cho đơn hàng tối thiểu 1 triệu',
    condition: 'Điều kiện',
  },
  {
    code: 'FREESHIP',
    title: 'NHẬP MÃ: FREESHIP',
    description: 'Miễn phí vận chuyển cho đơn từ 500K',
    condition: 'Điều kiện',
  },
]

export const articles = [
  {
    id: 'article-1',
    category: '24H CÔNG NGHỆ',
    title: 'Các thay đổi đáng chú ý từ Android 14',
    date: 'Thứ Ba, 21/12/2021',
    summary: 'Tổng hợp giao diện mới, quyền riêng tư và các cải tiến pin dành cho thiết bị đời mới.',
  },
  {
    id: 'article-2',
    category: 'KINH NGHIỆM HAY - MẸO VẶT',
    title: 'Smartphone Android có dùng được tai nghe AirPods?',
    date: 'Thứ Ba, 21/12/2021',
    summary: 'Giải thích khả năng kết nối, codec hỗ trợ và các giới hạn thực tế cần biết.',
  },
  {
    id: 'article-3',
    category: 'KINH NGHIỆM HAY - MẸO VẶT',
    title: 'Đánh giá chi tiết tai nghe bluetooth Hoco',
    date: 'Thứ Ba, 21/12/2021',
    summary: 'Nhìn thực dụng về pin, độ ổn định kết nối và chất âm trong tầm giá.',
  },
  {
    id: 'article-4',
    category: '24H CÔNG NGHỆ',
    title: 'Smartphone gập Oppo Find N sẽ ra mắt vào 15/12',
    date: 'Thứ Ba, 21/12/2021',
    summary: 'Một trong những thiết bị được chờ đợi trong giai đoạn cuối năm với thiết kế gập mới.',
  },
  {
    id: 'article-5',
    category: '24H CÔNG NGHỆ',
    title: 'Oppo dẫn đầu phân khúc smartphone tầm trung 7-10 triệu',
    date: 'Thứ Ba, 21/12/2021',
    summary: 'Reno5, Reno6 Z và nhiều model bán chạy góp phần tạo nên sức hút lớn cho hãng.',
  },
  {
    id: 'article-6',
    category: 'KINH NGHIỆM HAY - MẸO VẶT',
    title: '6 lỗi thường dính khi mua tai nghe bluetooth',
    date: 'Thứ Ba, 21/12/2021',
    summary: 'Những điểm cần lưu ý về dung lượng pin, độ trễ và khả năng kết nối thực tế.',
  },
  {
    id: 'article-7',
    category: '24H CÔNG NGHỆ',
    title: 'Xiaomi chính thức mang Redmi Watch 2 Lite đến Việt Nam',
    date: 'Thứ Ba, 21/12/2021',
    summary: 'Sản phẩm đồng hồ thông minh giá dễ tiếp cận với nhiều thay đổi đáng chú ý.',
  },
  {
    id: 'article-8',
    category: 'KINH NGHIỆM HAY - MẸO VẶT',
    title: 'Pin sạc dự phòng - Hành trang không thể thiếu cho mỗi chuyến đi',
    date: 'Thứ Ba, 21/12/2021',
    summary: 'Cùng xem những tiêu chí chọn mua pin sạc dự phòng phù hợp với nhu cầu thực tế.',
  },
]

export const footerColumns = [
  {
    title: 'Hỗ trợ khách hàng',
    items: ['Giới thiệu', 'Liên hệ', 'Hệ thống cửa hàng', 'Hướng dẫn trả góp', 'Câu hỏi thường gặp'],
  },
  {
    title: 'Chính sách',
    items: ['Chính sách bảo mật', 'Chính sách đổi trả', 'Chính sách bảo hành', 'Chính sách đặt cọc giữ hàng'],
  },
  {
    title: 'Tổng đài hỗ trợ',
    items: ['Gọi mua hàng: 19006750', 'Gọi bảo hành: 19006750', 'Gọi khiếu nại: 19006750'],
  },
]
