import { Link } from 'react-router-dom'
import { Mail, MapPin, Smartphone } from 'lucide-react'
import { NewsletterForm } from '../../components/NewsletterForm'
import { ROUTES } from '../../constants/routes'
import brandLogo from '../../assets/tech-do.png'
import paymentImage from '../../assets/PTTT.png'
import facebookIcon from '../../assets/UngDung/Fb.png'
import zaloIcon from '../../assets/UngDung/Zalo.png'
import instagramIcon from '../../assets/UngDung/Intas.png'

const supportLinks = [
  { label: 'Giới thiệu', to: ROUTES.HOME },
  { label: 'Liên hệ', to: ROUTES.HOME },
  { label: 'Hệ thống cửa hàng', to: ROUTES.STORE_SYSTEM },
  { label: 'Hướng dẫn trả góp', to: ROUTES.GUIDE_INSTALLMENT },
  { label: 'Hướng dẫn mua hàng Online', to: ROUTES.GUIDE_BUY_ONLINE },
  { label: 'Thu mua máy cũ', to: ROUTES.GUIDE_SELL_USED },
  { label: 'Câu hỏi thường gặp', to: ROUTES.ACCOUNT },
]

const policyLinks = ['Chính sách bảo mật', 'Chính sách đổi trả', 'Chính sách bảo hành', 'Chính sách đặt cọc giữ hàng']

const hotlineItems = [
  ['Gọi mua hàng', '19006750', '(8h-20h)'],
  ['Gọi bảo hành', '19006750', '(8h-20h)'],
  ['Gọi khiếu nại', '19006750', '(8h-20h)'],
]

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="newsletter">
        <div className="newsletter__inner">
          <div className="newsletter__socials" aria-label="Mạng xã hội">
            <a href="#hero" aria-label="Facebook">
              <img src={facebookIcon} alt="" aria-hidden="true" />
            </a>
            <a href="#hero" aria-label="Zalo">
              <img src={zaloIcon} alt="" aria-hidden="true" />
            </a>
            <a href="#hero" aria-label="Instagram">
              <img src={instagramIcon} alt="" aria-hidden="true" />
            </a>
          </div>

          <div className="newsletter__message">
            <div className="newsletter__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true">
                <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 3.2V17h16V8.2l-8 5.3-8-5.3zm14.8-1.2H5.2L12 11l6.8-4.8z" />
              </svg>
            </div>
            <p>
              Bạn muốn nhận khuyến mãi đặc biệt?
              <br />
              Đăng ký ngay.
            </p>
          </div>

          <NewsletterForm />
        </div>
      </div>

      <div className="footer__content">
        <div className="footer__brand">
          <Link to={ROUTES.HOME} aria-label="techstore.com">
            <img className="footer__logo" src={brandLogo} alt="techstore.com" />
          </Link>

          <div className="footer__contact">
            <p>
              <MapPin size={16} strokeWidth={2.3} />
              <span>
                <strong>Địa chỉ:</strong> Lầu 3 - Tòa nhà Lữ Gia - Số 70 Lữ Gia - P.15 - Q.11, Tp.HCM
              </span>
            </p>
            <p>
              <Smartphone size={16} strokeWidth={2.3} />
              <span>
                <strong>Số điện thoại:</strong> 19006750
              </span>
            </p>
            <p>
              <Mail size={16} strokeWidth={2.3} />
              <span>
                <strong>Email:</strong> support@sapo.vn
              </span>
            </p>
          </div>
        </div>

        <div className="footer__column footer__column--menu">
          <h3>Hỗ trợ khách hàng</h3>
          <ul>
            {supportLinks.map((item) => (
              <li key={item.label}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__column footer__column--menu">
          <h3>Chính sách</h3>
          <ul>
            {policyLinks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="footer__column footer__column--support">
          <h3>Tổng đài hỗ trợ</h3>
          <ul className="footer__hotline-list">
            {hotlineItems.map(([label, phone, time]) => (
              <li key={label}>
                {label}: <span>{phone}</span> {time}
              </li>
            ))}
          </ul>

          <h3 className="footer__payment-title">Phương thức thanh toán</h3>
          <img className="footer__payment-image" src={paymentImage} alt="Phương thức thanh toán" />
        </div>
      </div>

      <div className="footer__bottom">© Bản quyền thuộc về EGANY | Cung cấp bởi Sapo</div>
    </footer>
  )
}
