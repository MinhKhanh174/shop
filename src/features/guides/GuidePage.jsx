import { ChevronRight, CheckCircle2, CircleHelp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import './GuidePage.css'

const GUIDE_CONTENT = {
  sellUsed: {
    breadcrumb: 'Hướng dẫn bán máy cũ',
    title: 'Hướng dẫn bán máy cũ',
    intro:
      'Gửi máy cũ về Techstore để được kiểm tra, định giá và hỗ trợ thu mua nhanh theo tình trạng thực tế của thiết bị.',
    steps: [
      'Chụp ảnh máy và ghi rõ model, dung lượng, tình trạng ngoại hình.',
      'Liên hệ đội ngũ tư vấn để nhận mức giá tham khảo ban đầu.',
      'Mang máy tới cửa hàng hoặc gửi theo hướng dẫn để kiểm tra trực tiếp.',
      'Xác nhận giá cuối cùng và hoàn tất giao dịch nếu bạn đồng ý.',
    ],
    notes: [
      'Máy còn hoạt động, không khóa tài khoản và không vào danh sách tranh chấp sẽ được xử lý nhanh hơn.',
      'Mức giá thu mua phụ thuộc vào tình trạng máy, phụ kiện đi kèm và giá thị trường tại thời điểm tiếp nhận.',
    ],
  },
  buyOnline: {
    breadcrumb: 'Hướng dẫn mua hàng online',
    title: 'Hướng dẫn mua hàng online',
    intro:
      'Đặt hàng online giúp bạn chọn sản phẩm nhanh, theo dõi trạng thái đơn hàng và nhận hỗ trợ giao hàng tận nơi.',
    steps: [
      'Chọn sản phẩm cần mua và mở trang chi tiết.',
      'Thêm vào giỏ hàng hoặc bấm mua ngay.',
      'Nhập thông tin nhận hàng, chọn phương thức thanh toán.',
      'Xác nhận đơn hàng và chờ bộ phận chăm sóc liên hệ.',
    ],
    notes: [
      'Bạn nên kiểm tra kỹ địa chỉ, số điện thoại và màu/dung lượng trước khi xác nhận.',
      'Nếu cần hỗ trợ, đội ngũ tư vấn có thể hướng dẫn qua điện thoại hoặc tin nhắn.',
    ],
  },
  installment: {
    breadcrumb: 'Hướng dẫn trả góp',
    title: 'Hướng dẫn trả góp',
    intro:
      'Trả góp giúp bạn sở hữu sản phẩm trước và thanh toán dần theo kỳ hạn phù hợp với khả năng tài chính.',
    steps: [
      'Chọn sản phẩm và bấm nút mua trả góp.',
      'Điền thông tin cá nhân và chọn đơn vị hỗ trợ trả góp.',
      'Chuẩn bị giấy tờ theo yêu cầu của đơn vị xét duyệt.',
      'Hoàn tất duyệt hồ sơ và nhận máy sau khi hồ sơ được chấp thuận.',
    ],
    notes: [
      'Điều kiện duyệt có thể thay đổi tùy sản phẩm, giá trị đơn hàng và chính sách của đơn vị tài chính.',
      'Bạn nên đọc kỹ phí, kỳ hạn và lịch thanh toán trước khi xác nhận hồ sơ.',
    ],
  },
}

function GuideBreadcrumb({ label }) {
  return (
    <nav className="guide-page__breadcrumb" aria-label="Breadcrumb">
      <Link to={ROUTES.HOME}>Trang chủ</Link>
      <ChevronRight size={14} aria-hidden="true" />
      <span>{label}</span>
    </nav>
  )
}

function GuidePage({ variant }) {
  const content = GUIDE_CONTENT[variant] ?? GUIDE_CONTENT.buyOnline

  return (
    <div className="guide-page">
      <div className="guide-page__container">
        <GuideBreadcrumb label={content.breadcrumb} />

        <div className="guide-page__card">
          <header className="guide-page__header">
            <span className="guide-page__eyebrow">HƯỚNG DẪN</span>
            <h1>{content.title}</h1>
            <p>{content.intro}</p>
          </header>

          <div className="guide-page__layout">
            <section className="guide-page__section">
              <div className="guide-page__section-title">
                <CheckCircle2 size={18} />
                <h2>Các bước thực hiện</h2>
              </div>
              <ol className="guide-page__steps">
                {content.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            <aside className="guide-page__section guide-page__aside">
              <div className="guide-page__section-title">
                <CircleHelp size={18} />
                <h2>Lưu ý</h2>
              </div>
              <ul className="guide-page__notes">
                {content.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuidePage
