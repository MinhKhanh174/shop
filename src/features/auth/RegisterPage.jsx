import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import './AuthPage.css'
import { ROUTES } from '../../config/routes'
import { saveRegisteredAccount, setAuthSession } from '../../utils/authStorage'
import { isValidEmail, requiredMessage, isNonEmpty } from '../../utils/formValidation'
import { InternationalPhoneInput } from '../../components/phone/InternationalPhoneInput'
import { isValidE164PhoneNumber, normalizePhoneToE164 } from '../../utils/phoneValidation'
import { addUser } from '../../services/usersApi'

export default function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getRedirectPath = () => {
    const from = location.state?.from

    if (typeof from === 'string' && from.trim()) {
      return from
    }

    if (from && typeof from === 'object') {
      const pathname = typeof from.pathname === 'string' && from.pathname ? from.pathname : ROUTES.ACCOUNT
      const search = typeof from.search === 'string' ? from.search : ''
      return `${pathname}${search}`
    }

    return ROUTES.ACCOUNT
  }

  const validate = () => {
    const nextErrors = {}

    if (!isNonEmpty(lastName)) {
      nextErrors.lastName = requiredMessage('họ')
    }

    if (!isNonEmpty(firstName)) {
      nextErrors.firstName = requiredMessage('tên')
    }

    if (!isNonEmpty(phone)) {
      nextErrors.phone = requiredMessage('số điện thoại')
    } else if (!isValidE164PhoneNumber(phone)) {
      nextErrors.phone = 'Số điện thoại không hợp lệ.'
    }

    if (!isNonEmpty(email)) {
      nextErrors.email = requiredMessage('email')
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Email không hợp lệ.'
    }

    if (String(password).trim().length < 6) {
      nextErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.'
    }

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const account = {
        lastName: String(lastName).trim(),
        firstName: String(firstName).trim(),
        phone: normalizePhoneToE164(phone),
        email: String(email).trim().toLowerCase(),
        password: String(password).trim(),
        username: String(email).trim().toLowerCase().split('@')[0] || String(firstName).trim().toLowerCase(),
      }

      let remoteAccount = null
      try {
        remoteAccount = await addUser(account)
      } catch (error) {
        console.error(error)
      }

      saveRegisteredAccount(account)
      setAuthSession(remoteAccount || account, remoteAccount || {})
      toast.success('Đăng ký thành công')
      navigate(getRedirectPath(), { replace: true })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__inner">
        <div className="auth-page__breadcrumb">
          <span>Trang chủ</span> <span>/</span> <strong>Đăng ký tài khoản</strong>
        </div>

        <div className="register-page__content">
          <h1 className="auth-page__title">ĐĂNG KÝ TÀI KHOẢN</h1>
          <p className="register-page__subtitle">
            Bạn đã có tài khoản ? <Link to={ROUTES.LOGIN}>Đăng nhập tại đây.</Link>
          </p>

          <div className="register-page__section-title">THÔNG TIN CÁ NHÂN</div>

          <form className="register-page__form" onSubmit={handleSubmit} noValidate>
            <div className="register-page__field">
              <label htmlFor="register-lastname">
                Họ <span className="required">*</span>
              </label>
              <input
                id="register-lastname"
                type="text"
                placeholder="Họ"
                value={lastName}
                onChange={(event) => {
                  setLastName(event.target.value)
                  if (errors.lastName) {
                    setErrors((current) => ({ ...current, lastName: '' }))
                  }
                }}
                aria-invalid={errors.lastName ? 'true' : 'false'}
              />
              {errors.lastName ? <p className="auth-page__error">{errors.lastName}</p> : null}
            </div>

            <div className="register-page__field">
              <label htmlFor="register-firstname">
                Tên <span className="required">*</span>
              </label>
              <input
                id="register-firstname"
                type="text"
                placeholder="Tên"
                value={firstName}
                onChange={(event) => {
                  setFirstName(event.target.value)
                  if (errors.firstName) {
                    setErrors((current) => ({ ...current, firstName: '' }))
                  }
                }}
                aria-invalid={errors.firstName ? 'true' : 'false'}
              />
              {errors.firstName ? <p className="auth-page__error">{errors.firstName}</p> : null}
            </div>

            <div className="register-page__field">
              <label htmlFor="register-phone">
                Số điện thoại <span className="required">*</span>
              </label>
              <InternationalPhoneInput
                id="register-phone"
                variant="auth"
                value={phone}
                onChange={(nextPhone) => {
                  setPhone(nextPhone)
                  if (errors.phone) {
                    setErrors((current) => ({ ...current, phone: '' }))
                  }
                }}
                error={errors.phone}
                placeholder="Số điện thoại"
              />
            </div>

            <div className="register-page__field">
              <label htmlFor="register-email">
                Email <span className="required">*</span>
              </label>
              <input
                id="register-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (errors.email) {
                    setErrors((current) => ({ ...current, email: '' }))
                  }
                }}
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email ? <p className="auth-page__error">{errors.email}</p> : null}
            </div>

            <div className="register-page__field">
              <label htmlFor="register-password">
                Mật khẩu <span className="required">*</span>
              </label>
              <input
                id="register-password"
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (errors.password) {
                    setErrors((current) => ({ ...current, password: '' }))
                  }
                }}
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              {errors.password ? <p className="auth-page__error">{errors.password}</p> : null}
            </div>

            <button type="submit" className="register-page__submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <div className="register-page__divider">Hoặc đăng nhập bằng</div>

          <div className="register-page__social">
            <button type="button" className="register-page__social-button register-page__social-button--facebook">
              <span>f</span>
              <em>Facebook</em>
            </button>
            <button type="button" className="register-page__social-button register-page__social-button--google">
              <span>G+</span>
              <em>Google</em>
            </button>
          </div>

          <div className="register-page__spacer" />
        </div>
      </div>
    </div>
  )
}
