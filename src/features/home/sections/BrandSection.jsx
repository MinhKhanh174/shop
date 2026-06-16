import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { SectionHeading } from '../../../shared/ui/SectionHeading'
import sonyLogo from '../../../assets/ThuongHieuSP/SONY.png'
import brand2 from '../../../assets/ThuongHieuSP/brand_2.webp'
import brand3 from '../../../assets/ThuongHieuSP/brand_3.webp'
import brand4 from '../../../assets/ThuongHieuSP/brand_4.webp'
import brand5 from '../../../assets/ThuongHieuSP/brand_5.webp'
import brand6 from '../../../assets/ThuongHieuSP/brand_6.webp'
import brand7 from '../../../assets/ThuongHieuSP/brand_7.webp'
import brand8 from '../../../assets/ThuongHieuSP/brand_8.webp'
import brand9 from '../../../assets/ThuongHieuSP/brand_9.webp'
import brand10 from '../../../assets/ThuongHieuSP/brand_10.webp'
import brand11 from '../../../assets/ThuongHieuSP/brand_11.webp'
import brand12 from '../../../assets/ThuongHieuSP/brand_12.webp'
import brand13 from '../../../assets/ThuongHieuSP/brand_13.webp'
import brand14 from '../../../assets/ThuongHieuSP/brand_14.webp'

export function BrandSection() {
  const brandLogos = [
    { name: 'Sony', src: sonyLogo },
    { name: 'Xiaomi', src: brand2 },
    { name: 'Oppo', src: brand3 },
    { name: 'Asus', src: brand4 },
    { name: 'JBL', src: brand5 },
    { name: 'Anker', src: brand6 },
    { name: 'hoco.', src: brand7 },
    { name: 'Apple', src: brand8 },
    { name: 'LG', src: brand9 },
    { name: 'Samsung', src: brand10 },
    { name: 'realme', src: brand11 },
    { name: 'BlackBerry', src: brand12 },
    { name: 'HUAWEI', src: brand13 },
    { name: 'Lenovo', src: brand14 },
  ]

  return (
    <section className="section">
      <SectionHeading eyebrow="Thương hiệu sản phẩm" title="THƯƠNG HIỆU SẢN PHẨM" />
      <div className="brand-logo-grid" aria-label="Thương hiệu sản phẩm">
        {brandLogos.map((brand) => (
          <Link key={brand.name} className="brand-logo" to={ROUTES.PRODUCTS}>
            <img className="brand-logo__image" src={brand.src} alt={brand.name} loading="lazy" />
          </Link>
        ))}
      </div>
    </section>
  )
}
