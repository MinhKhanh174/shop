import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock3,
  ChevronDown,
  HelpCircle,
  LoaderCircle,
  LogOut,
  MapPin,
  MessageCircle,
  Printer,
  Truck,
  User,
} from 'lucide-react'
import toast from 'react-hot-toast'
import logoSrc from '../../assets/logo.webp'
import { ROUTES } from '../../constants/routes'
import { coupons } from '../../data/siteConfig'
import { InternationalPhoneInput } from '../../components/phone/InternationalPhoneInput'
import { useCart } from '../../hooks/useCart'
import { getDistrictsByProvinceCode, getProvinces, getWardsByDistrictCode } from '../../services/addressApi'
import { formatCurrency } from '../../utils/currency'
import { loadAddresses } from '../../utils/addressStorage'
import { isValidEmail, isNonEmpty, requiredMessage } from '../../utils/formValidation'
import { isValidE164PhoneNumber, normalizePhoneToE164 } from '../../utils/phoneValidation'
import { createCheckoutOrder } from '../../utils/orderFactory'
import { saveTempOrder } from '../../utils/orderStorage'
import { sendOrderEmail } from '../../services/mailService'
import { useCartStore } from '../../store/useCartStore'
import { persistCartToBackend } from '../../services/cartService'
import { removeItem } from '../../storage/localStorage'
import { clearAuthSession, getAuthUser, hasAuthSession } from '../../utils/authStorage'
import { getCartStorageKey } from '../../services/cartService'
import './CheckoutPage.css'

const PAYMENT_OPTIONS = [
  {
    id: 'bank-transfer',
    label: 'Chuyển khoản qua ngân hàng',
  },
  {
    id: 'cod',
    label: 'Thanh toán khi giao hàng (COD)',
  },
]

const INITIAL_FORM = {
  email: '',
  fullName: '',
  phone: '',
  address: '',
  provinceCode: '',
  provinceName: '',
  districtCode: '',
  districtName: '',
  wardCode: '',
  wardName: '',
  note: '',
}

function stripVietnameseAccents(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function filterAddressOptions(options, searchValue) {
  const normalizedSearch = stripVietnameseAccents(searchValue)

  if (!normalizedSearch) {
    return options
  }

  return options.filter((option) => {
    return (
      stripVietnameseAccents(option.name).includes(normalizedSearch) ||
      stripVietnameseAccents(option.code).includes(normalizedSearch)
    )
  })
}

function buildCheckoutProfile(user) {
  const address = user?.address ?? {}
  const cityOrProvince = String(address.state ?? address.city ?? '').trim()
  const line1 = String(address.address ?? '').trim()
  const street = String(address.street ?? '').trim()
  const city = String(address.city ?? '').trim()
  const country = String(address.country ?? '').trim()

  return {
    email: String(user?.email ?? '').trim().toLowerCase(),
    fullName: [user?.firstName, user?.lastName].map((value) => String(value ?? '').trim()).filter(Boolean).join(' ').trim(),
    phone: String(user?.phone ?? '').trim(),
    address: [line1, street].filter(Boolean).join(', ') || line1 || street,
    provinceCode: String(address.stateCode ?? '').trim(),
    provinceName: cityOrProvince,
    districtCode: '',
    districtName: city,
    wardCode: '',
    wardName: '',
    note: '',
    country,
  }
}

function buildCheckoutProfileFromSavedAddress(address, user) {
  const fallbackUser = buildCheckoutProfile(user)

  if (!address || typeof address !== 'object') {
    return INITIAL_FORM
  }

  return {
    email: fallbackUser.email,
    fullName: address.fullName || fallbackUser.fullName,
    phone: address.phone || fallbackUser.phone,
    address: address.address || fallbackUser.address,
    provinceCode: String(address.provinceCode ?? '').trim(),
    provinceName: String(address.provinceName ?? '').trim(),
    districtCode: String(address.districtCode ?? '').trim(),
    districtName: String(address.districtName ?? '').trim(),
    wardCode: String(address.wardCode ?? '').trim(),
    wardName: String(address.wardName ?? '').trim(),
    note: '',
  }
}

function buildAddressBookSummary(address) {
  return [address?.fullName, address?.address, address?.wardName, address?.districtName, address?.provinceName, address?.countryName]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .join(', ')
}

function AddressBookDropdown({
  addresses = [],
  selectedAddressId = 'manual',
  isOpen = false,
  onToggle,
  onSelect,
  containerRef,
  hideLabel = false,
}) {
  const manualOption = {
    id: 'manual',
    name: 'Địa chỉ khác...',
    summary: 'Cho phép sửa thủ công',
  }

  const addressOptions = addresses.map((address) => ({
    id: address.id,
    name: address.defaultAddress ? 'Địa chỉ mặc định' : address.fullName || 'Địa chỉ đã lưu',
    summary: buildAddressBookSummary(address),
    raw: address,
  }))

  const selectedOption =
    selectedAddressId === 'manual'
      ? manualOption
      : addressOptions.find((option) => option.id === selectedAddressId) ?? addressOptions[0] ?? manualOption

  const selectedLabel =
    selectedOption?.id === 'manual' ? selectedOption?.name ?? 'Địa chỉ khác...' : selectedOption?.summary || selectedOption?.name

  const visibleOptions = [manualOption, ...addressOptions]

  return (
    <div ref={containerRef} className="checkout-address-select">
      <span className={hideLabel ? 'sr-only' : ''}>Sổ địa chỉ</span>
      <button
        type="button"
        className="checkout-address-select__control"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="checkout-address-select__value">
          {selectedLabel}
        </span>
        <ChevronDown size={16} className="checkout-address-select__chevron" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="checkout-address-select__menu checkout-recipient-select__menu" role="dialog" aria-label="Sổ địa chỉ">
          <div className="checkout-address-select__options checkout-recipient-select__options" role="listbox">
            {visibleOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`checkout-address-select__option checkout-recipient-select__option${
                  option.id === selectedAddressId ? ' is-selected' : ''
                }`}
                onClick={() => onSelect(option)}
                title={option.summary || option.name}
              >
                <span className="checkout-address-select__option-name">{option.name}</span>
                {option.id === 'manual' ? null : <small>{option.summary}</small>}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CheckoutField({
  label,
  placeholder,
  type = 'text',
  disabled = false,
  readOnly = false,
  className = '',
  value = '',
  onChange,
  hideLabel = false,
  error = '',
}) {
  return (
    <label className={`checkout-field ${className}`.trim()}>
      <span className={hideLabel ? 'sr-only' : ''}>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        value={value}
        onChange={onChange}
        aria-invalid={error ? 'true' : 'false'}
      />
      {error ? <p className="checkout-page__field-error">{error}</p> : null}
    </label>
  )
}

function AddressDropdown({
  label,
  placeholder,
  valueLabel,
  disabled = false,
  hideLabel = false,
  error = '',
  isOpen = false,
  loading = false,
  fetchError = '',
  searchValue = '',
  options = [],
  onToggle,
  onSelect,
  onSearchChange,
  onRetry,
  containerRef,
  searchInputRef,
}) {
  const hasVisibleOptions = options.length > 0

  return (
    <div
      ref={containerRef}
      className={`checkout-address-select${disabled ? ' is-disabled' : ''}${error ? ' has-error' : ''}`}
    >
      <span className={hideLabel ? 'sr-only' : ''}>{label}</span>
      <button
        type="button"
        className="checkout-address-select__control"
        onClick={onToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={error ? 'true' : 'false'}
      >
        <span className={`checkout-address-select__value${valueLabel ? '' : ' is-placeholder'}`}>
          {valueLabel || placeholder}
        </span>
        <ChevronDown size={16} className="checkout-address-select__chevron" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="checkout-address-select__menu" role="dialog" aria-label={label}>
          <div className="checkout-address-select__search">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm kiếm"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          {loading ? (
            <div className="checkout-address-select__state">
              <LoaderCircle size={18} className="checkout-address-select__spinner" aria-hidden="true" />
              <span>Đang tải danh sách...</span>
            </div>
          ) : fetchError ? (
            <div className="checkout-address-select__state checkout-address-select__state--error">
              <span>{fetchError}</span>
              <button type="button" className="checkout-address-select__retry" onClick={onRetry}>
                Thử lại
              </button>
            </div>
          ) : hasVisibleOptions ? (
            <div className="checkout-address-select__options" role="listbox">
              {options.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  className="checkout-address-select__option"
                  onClick={() => onSelect(option)}
                  title={option.name}
                >
                  <span className="checkout-address-select__option-name">{option.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="checkout-address-select__state">Không tìm thấy</div>
          )}
        </div>
      ) : null}

      {error ? <p className="checkout-page__field-error">{error}</p> : null}
    </div>
  )
}

function PaymentRow({ label, selected, onClick, disabled = false }) {
  return (
    <button
      type="button"
      className={`payment-row${selected ? ' is-selected' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="payment-row__radio" aria-hidden="true" />
      <span className="payment-row__label">{label}</span>
      <span className="payment-row__badge" aria-hidden="true">
        <Banknote size={14} />
      </span>
    </button>
  )
}

function OrderItem({ item }) {
  return (
    <div className="order-item">
      <div className="order-item__thumb-wrap">
        <img src={item.image} alt={item.name} className="order-item__thumb" />
        <span className="order-item__qty">{item.quantity}</span>
      </div>
      <div className="order-item__info">
        <p className="order-item__name">{item.name}</p>
        <p className="order-item__variant">{item.variant ?? item.brand ?? ''}</p>
      </div>
      <div className="order-item__price">{formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0))}</div>
    </div>
  )
}

function getCouponDiscountAmount(code, subtotal, shippingFee = 0) {
  const normalizedCode = String(code ?? '').trim().toUpperCase()
  const minimumSubtotalForPercentageCoupons = 500000

  if (!normalizedCode) {
    return 0
  }

  switch (normalizedCode) {
    case 'EGA50':
      return subtotal >= minimumSubtotalForPercentageCoupons ? Math.min(subtotal * 0.5, 300000) : 0
    case 'EGA15':
      return subtotal >= minimumSubtotalForPercentageCoupons ? Math.min(subtotal * 0.15, 250000) : 0
    case 'EGA99K':
      return subtotal >= 1000000 ? 99000 : 0
    case 'FREESHIP':
      return shippingFee
    default:
      return 0
  }
}

function buildCheckoutErrors(values, cartItems = []) {
  const nextErrors = {}

  if (!isNonEmpty(values.email)) {
    nextErrors.email = requiredMessage('email')
  } else if (!isValidEmail(values.email)) {
    nextErrors.email = 'Email không hợp lệ.'
  }

  if (!isNonEmpty(values.fullName)) {
    nextErrors.fullName = requiredMessage('họ và tên')
  }

  if (!isNonEmpty(values.phone)) {
    nextErrors.phone = requiredMessage('số điện thoại')
  } else if (!isValidE164PhoneNumber(values.phone)) {
    nextErrors.phone = 'Số điện thoại không hợp lệ.'
  }

  if (!isNonEmpty(values.address)) {
    nextErrors.address = requiredMessage('địa chỉ nhận hàng')
  }

  if (!isNonEmpty(values.provinceCode)) {
    nextErrors.provinceCode = requiredMessage('tỉnh/thành')
  }

  if (!isNonEmpty(values.districtCode)) {
    nextErrors.districtCode = requiredMessage('quận/huyện')
  }

  if (!isNonEmpty(values.wardCode)) {
    nextErrors.wardCode = requiredMessage('phường/xã')
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    nextErrors.cart = 'Giá» hĂ ng pháº£i cĂ³ Ă­t nháº¥t 1 sáº£n pháº©m.'
  }

  return nextErrors
}

function CheckoutSuccessModern({ order, onContinueShopping }) {
  const items = Array.isArray(order?.items) ? order.items : []
  const subtotal = typeof order?.subtotal === 'number' ? order.subtotal : 0
  const shippingFee = typeof order?.shippingFee === 'number' ? order.shippingFee : 0
  const grandTotal = typeof order?.grandTotal === 'number' ? order.grandTotal : subtotal + shippingFee

  const deliveryWindow = (() => {
    const baseDate = order?.createdAt ? new Date(order.createdAt) : new Date()
    const validBaseDate = Number.isNaN(baseDate.getTime()) ? new Date() : baseDate
    const startDate = new Date(validBaseDate)
    const endDate = new Date(validBaseDate)

    startDate.setDate(startDate.getDate() + 2)
    endDate.setDate(endDate.getDate() + 4)

    const startDay = startDate.getDate()
    const endDay = endDate.getDate()
    const monthLabel = startDate.getMonth() + 1

    return `${startDay} - ${endDay} Tháng ${monthLabel}`
  })()

  const addressLabel = [
    order?.customer?.address,
    order?.customer?.wardName,
    order?.customer?.districtName,
    order?.customer?.provinceName,
  ]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .join(', ')

  return (
    <div className="checkout-page checkout-page--success">
      <div className="checkout-page__success-shell">
        <div className="checkout-page__success-hero">
          <div className="checkout-page__success-badge" aria-hidden="true">
            <CheckCircle2 size={30} strokeWidth={2.6} />
          </div>
          <h1>Cảm ơn bạn đã đặt hàng!</h1>
          <p className="checkout-page__success-order-id">
            Mã đơn hàng của bạn là <strong>#{order?.id ?? '---'}</strong>
          </p>
          <p className="checkout-page__success-note">
            Chúng tôi đã gửi email xác nhận kèm thông tin chi tiết đơn hàng đến bạn.
          </p>
        </div>

        <div className="checkout-page__success-grid">
          <div className="checkout-page__success-column checkout-page__success-column--left">
            <section className="checkout-page__success-card checkout-page__success-card--order">
              <h2>Chi tiết đơn hàng</h2>
              <div className="checkout-page__success-items">
                {items.map((item) => {
                  const quantity = Number(item.quantity) || 1
                  const itemTotal = (Number(item.price) || 0) * quantity

                  return (
                    <article key={item.id} className="checkout-page__success-item">
                      <div className="checkout-page__success-thumb">
                        {item.image ? <img src={item.image} alt={item.name} /> : null}
                      </div>
                      <div className="checkout-page__success-item-body">
                        <h3>{item.name}</h3>
                        <p>Số lượng: {String(quantity).padStart(2, '0')}</p>
                      </div>
                      <div className="checkout-page__success-item-price">{formatCurrency(itemTotal)}</div>
                    </article>
                  )
                })}
              </div>
            </section>

            <section className="checkout-page__success-card checkout-page__success-card--summary">
              <h2>Tổng cộng</h2>
              <div className="checkout-page__success-summary-row">
                <span>Tạm tính:</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div className="checkout-page__success-summary-row">
                <span>Phí vận chuyển:</span>
                <strong className="is-free">{shippingFee <= 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</strong>
              </div>
              <div className="checkout-page__success-summary-total">
                <span>Tổng số tiền:</span>
                <strong>{formatCurrency(grandTotal)}</strong>
              </div>
            </section>
          </div>

          <aside className="checkout-page__success-column checkout-page__success-column--right">
            <section className="checkout-page__success-card checkout-page__success-card--info">
              <div className="checkout-page__success-card-head">
                <Truck size={16} strokeWidth={2.3} />
                <h2>Giao hàng dự kiến</h2>
              </div>
              <div className="checkout-page__success-eta">{deliveryWindow}</div>
              <p className="checkout-page__success-subtext">Giao hàng nhanh bởi TechMart Express</p>
            </section>

            <section className="checkout-page__success-card checkout-page__success-card--address">
              <div className="checkout-page__success-card-head">
                <MapPin size={16} strokeWidth={2.3} />
                <h2>Địa chỉ nhận hàng</h2>
              </div>
              <p className="checkout-page__success-recipient">{order?.customer?.fullName || '---'}</p>
              <p className="checkout-page__success-phone">{order?.customer?.phone || '---'}</p>
              <p className="checkout-page__success-address">{addressLabel || '---'}</p>
            </section>

            <button type="button" className="checkout-page__success-cta" onClick={onContinueShopping}>
              Tiếp tục mua sắm
              <ArrowRight size={18} strokeWidth={2.4} />
            </button>

            <button type="button" className="checkout-page__success-print">
              <Printer size={16} strokeWidth={2.2} />
              In hóa đơn
            </button>
          </aside>
        </div>

        <section className="checkout-page__success-support">
          <p>Cần hỗ trợ về đơn hàng?</p>
          <div className="checkout-page__success-support-links">
            <a href="tel:19001000">
              <HelpCircle size={14} strokeWidth={2.2} />
              Trung tâm trợ giúp
            </a>
            <a href="https://zalo.me" target="_blank" rel="noreferrer">
              <MessageCircle size={14} strokeWidth={2.2} />
              Chat với nhân viên
            </a>
            <Link to={ROUTES.ACCOUNT_ORDERS}>
              <Clock3 size={14} strokeWidth={2.2} />
              Theo dõi đơn hàng
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const { cartItems } = useCart()
  const clearCart = useCartStore((state) => state.clearCart)
  const [authUser, setAuthUser] = useState(() => getAuthUser())
  const [savedAddresses, setSavedAddresses] = useState(() => (hasAuthSession() ? loadAddresses(getAuthUser()) : []))
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_OPTIONS[0].id)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCouponCode, setAppliedCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [formValues, setFormValues] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)
  const [selectedAddressId, setSelectedAddressId] = useState('manual')
  const [provinceOptions, setProvinceOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [wardOptions, setWardOptions] = useState([])
  const [provinceSearch, setProvinceSearch] = useState('')
  const [districtSearch, setDistrictSearch] = useState('')
  const [wardSearch, setWardSearch] = useState('')
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [provinceLoading, setProvinceLoading] = useState(false)
  const [districtLoading, setDistrictLoading] = useState(false)
  const [wardLoading, setWardLoading] = useState(false)
  const [provinceFetchError, setProvinceFetchError] = useState('')
  const [districtFetchError, setDistrictFetchError] = useState('')
  const [wardFetchError, setWardFetchError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)
  const provinceDropdownRef = useRef(null)
  const districtDropdownRef = useRef(null)
  const wardDropdownRef = useRef(null)
  const provinceSearchRef = useRef(null)
  const districtSearchRef = useRef(null)
  const wardSearchRef = useRef(null)
  const addressBookDropdownRef = useRef(null)
  const hasCouponCode = couponCode.trim().length > 0
  const isAuthenticated = Boolean(authUser && hasAuthSession())
  const orderSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0),
    [cartItems],
  )

  const orderItems = useMemo(() => cartItems, [cartItems])
  const shippingFee = 0
  const couponDiscount = useMemo(
    () => getCouponDiscountAmount(appliedCouponCode, orderSubtotal, shippingFee),
    [appliedCouponCode, orderSubtotal, shippingFee],
  )
  const grandTotal = Math.max(0, orderSubtotal + shippingFee - couponDiscount)
  const appliedCoupon = coupons.find((coupon) => coupon.code === appliedCouponCode) ?? null

  const selectedProvince = provinceOptions.find((item) => item.code === formValues.provinceCode) ?? null
  const selectedDistrict = districtOptions.find((item) => item.code === formValues.districtCode) ?? null
  const selectedWard = wardOptions.find((item) => item.code === formValues.wardCode) ?? null

  const provinceDisplayLabel = selectedProvince?.name || formValues.provinceName || ''
  const districtDisplayLabel = selectedDistrict?.name || formValues.districtName || ''
  const wardDisplayLabel = selectedWard?.name || formValues.wardName || ''

  const visibleProvinceOptions = useMemo(
    () => filterAddressOptions(provinceOptions, provinceSearch),
    [provinceOptions, provinceSearch],
  )
  const visibleDistrictOptions = useMemo(
    () => filterAddressOptions(districtOptions, districtSearch),
    [districtOptions, districtSearch],
  )
  const visibleWardOptions = useMemo(() => filterAddressOptions(wardOptions, wardSearch), [wardOptions, wardSearch])

  useEffect(() => {
    function handlePointerDown(event) {
      const activeRefs = [addressBookDropdownRef, provinceDropdownRef, districtDropdownRef, wardDropdownRef]
      const clickedInside = activeRefs.some((ref) => ref.current && ref.current.contains(event.target))

      if (!clickedInside) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [])

  useEffect(() => {
    const handleAuthChanged = (event) => {
      const nextUser = event?.detail ?? getAuthUser()
      const nextIsAuthenticated = Boolean(nextUser && (nextUser.accessToken || nextUser.refreshToken || hasAuthSession()))

      setAuthUser(nextUser)
      setActiveDropdown(null)

      if (nextIsAuthenticated) {
        const nextAddresses = loadAddresses(nextUser)

        setSavedAddresses(nextAddresses)
        setSelectedAddressId('manual')
        setFormValues(INITIAL_FORM)
        setFieldErrors({})
        return
      }

      setSavedAddresses([])
      setSelectedAddressId('manual')
      setFormValues(INITIAL_FORM)
      setFieldErrors({})
    }

    window.addEventListener('techstore:auth-changed', handleAuthChanged)

    return () => {
      window.removeEventListener('techstore:auth-changed', handleAuthChanged)
    }
  }, [])

  useEffect(() => {
    if (activeDropdown === 'province') {
      provinceSearchRef.current?.focus()
    } else if (activeDropdown === 'district') {
      districtSearchRef.current?.focus()
    } else if (activeDropdown === 'ward') {
      wardSearchRef.current?.focus()
    }
  }, [activeDropdown])

  useEffect(() => {
    let cancelled = false

    async function loadProvinceOptions() {
      if (provinceOptions.length > 0) {
        return
      }

      setProvinceLoading(true)
      setProvinceFetchError('')

      try {
        const data = await getProvinces()
        if (!cancelled) {
          setProvinceOptions(data)
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setProvinceFetchError('Không tải được danh sách, vui lòng thử lại')
        }
      } finally {
        if (!cancelled) {
          setProvinceLoading(false)
        }
      }
    }

    async function loadDistrictOptions(provinceCode) {
      if (!provinceCode) {
        return
      }

      if (districtOptions.length > 0 && formValues.provinceCode === provinceCode) {
        return
      }

      setDistrictLoading(true)
      setDistrictFetchError('')

      try {
        const data = await getDistrictsByProvinceCode(provinceCode)
        if (!cancelled) {
          setDistrictOptions(data)
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setDistrictFetchError('Không tải được danh sách, vui lòng thử lại')
        }
      } finally {
        if (!cancelled) {
          setDistrictLoading(false)
        }
      }
    }

    async function loadWardOptions(districtCode) {
      if (!districtCode) {
        return
      }

      if (wardOptions.length > 0 && formValues.districtCode === districtCode) {
        return
      }

      setWardLoading(true)
      setWardFetchError('')

      try {
        const data = await getWardsByDistrictCode(districtCode)
        if (!cancelled) {
          setWardOptions(data)
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setWardFetchError('Không tải được danh sách, vui lòng thử lại')
        }
      } finally {
        if (!cancelled) {
          setWardLoading(false)
        }
      }
    }

    if (activeDropdown === 'province') {
      void loadProvinceOptions()
    }

    if (activeDropdown === 'district') {
      void loadDistrictOptions(formValues.provinceCode)
    }

    if (activeDropdown === 'ward') {
      void loadWardOptions(formValues.districtCode)
    }

    return () => {
      cancelled = true
    }
  }, [
    activeDropdown,
    districtOptions.length,
    formValues.districtCode,
    formValues.provinceCode,
    provinceOptions.length,
    reloadToken,
    wardOptions.length,
  ])

  const handlePlaceOrder = async () => {
    const nextErrors = buildCheckoutErrors(formValues, cartItems)
    setFieldErrors(nextErrors)
    setSubmitError(nextErrors.cart ?? '')

    if (Object.keys(nextErrors).length > 0) {
      if (!nextErrors.cart) {
        setSubmitError('Vui lòng kiểm tra lại thông tin nhận hàng.')
      }
      return
    }

    const tempOrder = createCheckoutOrder({
      customer: {
        email: String(formValues.email).trim(),
        fullName: String(formValues.fullName).trim(),
        phone: normalizePhoneToE164(formValues.phone),
        address: String(formValues.address).trim(),
        provinceCode: String(formValues.provinceCode).trim(),
        provinceName: String(formValues.provinceName).trim(),
        districtCode: String(formValues.districtCode).trim(),
        districtName: String(formValues.districtName).trim(),
        wardCode: String(formValues.wardCode).trim(),
        wardName: String(formValues.wardName).trim(),
        province: String(formValues.provinceName).trim(),
        district: String(formValues.districtName).trim(),
        ward: String(formValues.wardName).trim(),
        note: String(formValues.note).trim(),
      },
      paymentMethod: PAYMENT_OPTIONS.find((option) => option.id === selectedPayment)?.label ?? selectedPayment,
      couponCode: appliedCouponCode,
      subtotal: orderSubtotal,
      shippingFee,
      discount: couponDiscount,
      grandTotal,
      items: orderItems,
      status: 'pending',
    })

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 700))

      const order = saveTempOrder(tempOrder)
      await sendOrderEmail(order)

      const currentUser = getAuthUser()
      await persistCartToBackend(currentUser, [])
      clearCart()
      removeItem(getCartStorageKey(currentUser))
      setPlacedOrder(order)
      toast.success(`Gửi mail và đặt hàng thành công: ${order.id}`)
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error && error.message ? error.message : 'Không thể gửi mail xác nhận. Vui lòng thử lại.'
      setSubmitError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApplyCoupon = () => {
    const normalizedCode = couponCode.trim().toUpperCase()
    const matchedCoupon = coupons.find((coupon) => coupon.code === normalizedCode)

    if (!matchedCoupon) {
      setAppliedCouponCode('')
      setCouponError('Mã khuyến mãi không hợp lệ')
      return
    }

    const discountAmount = getCouponDiscountAmount(matchedCoupon.code, orderSubtotal, shippingFee)

    if (discountAmount <= 0) {
      setAppliedCouponCode('')
      setCouponError('Mã khuyến mãi không hợp lệ')
      return
    }

    setAppliedCouponCode(matchedCoupon.code)
    setCouponError('')
    toast.success(`Đã áp dụng mã ${matchedCoupon.code}`)
  }

  const handleSelectProvince = (option) => {
    setFormValues((current) => ({
      ...current,
      provinceCode: option.code,
      provinceName: option.name,
      districtCode: '',
      districtName: '',
      wardCode: '',
      wardName: '',
    }))
    setFieldErrors((current) => ({
      ...current,
      provinceCode: '',
      districtCode: '',
      wardCode: '',
    }))
    setProvinceSearch('')
    setDistrictOptions([])
    setWardOptions([])
    setDistrictSearch('')
    setWardSearch('')
    setDistrictFetchError('')
    setWardFetchError('')
    setActiveDropdown(null)
  }

  const handleSelectDistrict = (option) => {
    setFormValues((current) => ({
      ...current,
      districtCode: option.code,
      districtName: option.name,
      wardCode: '',
      wardName: '',
    }))
    setFieldErrors((current) => ({
      ...current,
      districtCode: '',
      wardCode: '',
    }))
    setDistrictSearch('')
    setWardOptions([])
    setWardSearch('')
    setWardFetchError('')
    setActiveDropdown(null)
  }

  const handleSelectWard = (option) => {
    setFormValues((current) => ({
      ...current,
      wardCode: option.code,
      wardName: option.name,
    }))
    setFieldErrors((current) => ({
      ...current,
      wardCode: '',
    }))
    setWardSearch('')
    setActiveDropdown(null)
  }

  const openProvinceDropdown = () => {
    setActiveDropdown((current) => (current === 'province' ? null : 'province'))
  }

  const openDistrictDropdown = () => {
    if (!formValues.provinceCode) {
      return
    }

    setActiveDropdown((current) => (current === 'district' ? null : 'district'))
  }

  const openWardDropdown = () => {
    if (!formValues.districtCode) {
      return
    }

    setActiveDropdown((current) => (current === 'ward' ? null : 'ward'))
  }

  if (placedOrder) {
    return <CheckoutSuccessModern order={placedOrder} onContinueShopping={() => window.location.assign(ROUTES.PRODUCTS)} />
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page checkout-page--empty">
        <div className="checkout-page__empty-card">
          <h1>Thanh toán</h1>
          <p>Giỏ hàng đang trống. Bạn cần thêm sản phẩm trước khi thanh toán.</p>
          <Link to={ROUTES.PRODUCTS} className="checkout-page__back-link">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-page__inner">
        <header className="checkout-page__brand">
          <Link to={ROUTES.HOME} className="checkout-page__logo" aria-label="Techstore">
            <img src={logoSrc} alt="Techstore" />
          </Link>
        </header>

        <div className="checkout-page__layout">
          <section className="checkout-page__main">
            <div className="checkout-page__section-head">
              <h2>Thông tin nhận hàng</h2>
              {isAuthenticated ? (
                <button
                  type="button"
                  className="checkout-page__logout-button"
                  onClick={() => {
                    clearAuthSession()
                    setAuthUser(null)
                    setSavedAddresses([])
                    setSelectedAddressId('manual')
                    setFormValues(INITIAL_FORM)
                    setFieldErrors({})
                    setActiveDropdown(null)
                    toast.success('Đã đăng xuất')
                  }}
                >
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              ) : (
                <Link to={ROUTES.LOGIN} className="checkout-page__login-link">
                  <User size={18} />
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>

            <div className="checkout-page__form" key={selectedAddressId}>
              {isAuthenticated ? (
                <AddressBookDropdown
                  addresses={savedAddresses}
                  selectedAddressId={selectedAddressId}
                  isOpen={activeDropdown === 'address-book'}
                  onToggle={() => {
                    setActiveDropdown((current) => (current === 'address-book' ? null : 'address-book'))
                  }}
                  onSelect={(option) => {
                    setSelectedAddressId(option.id)

                    if (option.id !== 'manual') {
                      const selectedSavedAddress = savedAddresses.find((address) => address.id === option.id)

                      setFormValues((current) => ({
                        ...(selectedSavedAddress
                          ? buildCheckoutProfileFromSavedAddress(selectedSavedAddress, authUser)
                          : INITIAL_FORM),
                        note: current.note ?? '',
                      }))
                      setProvinceSearch('')
                      setDistrictSearch('')
                      setWardSearch('')
                      setDistrictOptions([])
                      setWardOptions([])
                      setFieldErrors({})
                    } else {
                      setFormValues(INITIAL_FORM)
                      setProvinceSearch('')
                      setDistrictSearch('')
                      setWardSearch('')
                      setProvinceOptions([])
                      setDistrictOptions([])
                      setWardOptions([])
                      setProvinceFetchError('')
                      setDistrictFetchError('')
                      setWardFetchError('')
                      setFieldErrors({})
                    }
                    setActiveDropdown(null)
                  }}
                  containerRef={addressBookDropdownRef}
                  hideLabel
                />
              ) : null}

              <CheckoutField
                label="Email"
                placeholder="Email"
                type="email"
                hideLabel
                value={formValues.email}
                readOnly={false}
                onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))}
                error={fieldErrors.email}
              />

              <CheckoutField
                label="Họ và tên"
                placeholder="Họ và tên"
                hideLabel
                value={formValues.fullName}
                readOnly={false}
                onChange={(event) => setFormValues((current) => ({ ...current, fullName: event.target.value }))}
                error={fieldErrors.fullName}
              />

              <div className="checkout-phone">
                <span className="sr-only">Số điện thoại</span>
                <InternationalPhoneInput
                  id="checkout-phone"
                  variant="checkout"
                  value={formValues.phone}
                  readOnly={false}
                  onChange={(nextPhone) =>
                    setFormValues((current) => ({
                      ...current,
                      phone: nextPhone,
                    }))
                  }
                  error={fieldErrors.phone}
                  placeholder="Số điện thoại"
                />
              </div>

              <CheckoutField
                label="Địa chỉ"
                placeholder="Địa chỉ"
                hideLabel
                value={formValues.address}
                readOnly={false}
                onChange={(event) => setFormValues((current) => ({ ...current, address: event.target.value }))}
                error={fieldErrors.address}
              />

              <AddressDropdown
                label="Tỉnh thành"
                placeholder="Tỉnh thành"
                hideLabel
                valueLabel={provinceDisplayLabel}
                error={fieldErrors.provinceCode}
                disabled={false}
                isOpen={activeDropdown === 'province'}
                loading={provinceLoading}
                fetchError={provinceFetchError}
                searchValue={provinceSearch}
                options={visibleProvinceOptions}
                onToggle={openProvinceDropdown}
                onSelect={handleSelectProvince}
                onSearchChange={setProvinceSearch}
                onRetry={() => {
                  setProvinceOptions([])
                  setProvinceFetchError('')
                  setReloadToken((current) => current + 1)
                  setActiveDropdown('province')
                }}
                containerRef={provinceDropdownRef}
                searchInputRef={provinceSearchRef}
              />

              <AddressDropdown
                label="Quận huyện"
                placeholder="Quận huyện"
                hideLabel
                valueLabel={districtDisplayLabel}
                error={fieldErrors.districtCode}
                disabled={!formValues.provinceCode}
                isOpen={activeDropdown === 'district'}
                loading={districtLoading}
                fetchError={districtFetchError}
                searchValue={districtSearch}
                options={visibleDistrictOptions}
                onToggle={openDistrictDropdown}
                onSelect={handleSelectDistrict}
                onSearchChange={setDistrictSearch}
                onRetry={() => {
                  setDistrictOptions([])
                  setDistrictFetchError('')
                  setReloadToken((current) => current + 1)
                  setActiveDropdown('district')
                }}
                containerRef={districtDropdownRef}
                searchInputRef={districtSearchRef}
              />

              <AddressDropdown
                label="Phường xã"
                placeholder="Phường xã"
                hideLabel
                valueLabel={wardDisplayLabel}
                error={fieldErrors.wardCode}
                disabled={!formValues.districtCode}
                isOpen={activeDropdown === 'ward'}
                loading={wardLoading}
                fetchError={wardFetchError}
                searchValue={wardSearch}
                options={visibleWardOptions}
                onToggle={openWardDropdown}
                onSelect={handleSelectWard}
                onSearchChange={setWardSearch}
                onRetry={() => {
                  setWardOptions([])
                  setWardFetchError('')
                  setReloadToken((current) => current + 1)
                  setActiveDropdown('ward')
                }}
                containerRef={wardDropdownRef}
                searchInputRef={wardSearchRef}
              />

              <label className="checkout-note">
                <span className="sr-only">Ghi chú (tùy chọn)</span>
                <textarea
                  placeholder="Ghi chú (tùy chọn)"
                  value={formValues.note}
                  onChange={(event) => setFormValues((current) => ({ ...current, note: event.target.value }))}
                />
              </label>
            </div>
          </section>

          <section className="checkout-page__middle">
            <div className="checkout-page__section-head checkout-page__section-head--spaced">
              <h2>Vận chuyển</h2>
            </div>

            <div className="checkout-page__shipping-alert">Vui lòng nhập thông tin giao hàng</div>

            <div className="checkout-page__section-head checkout-page__section-head--payment">
              <h2>Thanh toán</h2>
            </div>

            <div className="checkout-page__payment-box">
              {PAYMENT_OPTIONS.map((option) => (
                <PaymentRow
                  key={option.id}
                  label={option.label}
                  selected={selectedPayment === option.id}
                  onClick={() => setSelectedPayment(option.id)}
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </section>

          <aside className="checkout-page__summary">
            <h2 className="checkout-page__summary-title">Đơn hàng ({orderItems.length} sản phẩm)</h2>

            <div className="checkout-page__summary-list">
              {orderItems.map((item) => (
                <OrderItem key={item.id} item={item} />
              ))}
            </div>

            <div className="checkout-page__coupon">
              <input
                type="text"
                value={couponCode}
                onChange={(event) => {
                  setCouponCode(event.target.value)
                  if (couponError) {
                    setCouponError('')
                  }
                }}
                placeholder="Nhập mã giảm giá"
                aria-invalid={Boolean(couponError)}
                className={couponError ? 'is-invalid' : ''}
              />
              <button type="button" className={hasCouponCode ? 'is-active' : ''} onClick={handleApplyCoupon} disabled={isSubmitting}>
                Áp dụng
              </button>
            </div>
            {couponError ? <p className="checkout-page__coupon-error">{couponError}</p> : null}
            {appliedCoupon ? <p className="checkout-page__coupon-success">Đã áp dụng: {appliedCoupon.code}</p> : null}

            <div className="checkout-page__totals">
              <div className="checkout-page__total-row">
                <span>Tạm tính</span>
                <strong>{formatCurrency(orderSubtotal)}</strong>
              </div>
              {couponDiscount > 0 ? (
                <div className="checkout-page__total-row checkout-page__total-row--discount">
                  <span>Giảm giá</span>
                  <strong>-{formatCurrency(couponDiscount)}</strong>
                </div>
              ) : null}
              <div className="checkout-page__total-row">
                <span>Phí vận chuyển</span>
                <strong>{shippingFee > 0 ? formatCurrency(shippingFee) : '-'}</strong>
              </div>
              <div className="checkout-page__grand-total">
                <span>Tổng cộng</span>
                <strong>{formatCurrency(grandTotal)}</strong>
              </div>
            </div>

            {submitError ? <p className="checkout-page__coupon-error">{submitError}</p> : null}

            <div className="checkout-page__actions">
              <Link to={ROUTES.CART} className="checkout-page__back-cart">
                ‹ Quay về giỏ hàng
              </Link>
              <button
                type="button"
                className="checkout-page__place-order"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang đặt hàng...' : 'Đặt hàng'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

