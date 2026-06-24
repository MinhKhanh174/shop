import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import './AuthPage.css'
import { ROUTES } from '../../config/routes'
import { getRegisteredAccount, setAuthSession } from '../../utils/authStorage'
import { isValidEmail, requiredMessage, isNonEmpty } from '../../utils/formValidation'
import { loginUser } from '../../services/usersApi'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
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

    if (!isNonEmpty(email)) {
      nextErrors.email = requiredMessage('email')
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Email không hợp lệ.'
    }

    if (!isNonEmpty(password)) {
      nextErrors.password = requiredMessage('mật khẩu')
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
      const normalizedEmail = String(email).trim().toLowerCase()
      const normalizedPassword = String(password).trim()

      let authenticatedUser = null

      try {
        authenticatedUser = await loginUser({
          email: normalizedEmail,
          password: normalizedPassword,
        })
      } catch (error) {
        console.error(error)
      }

      if (!authenticatedUser) {
        const registeredAccount = getRegisteredAccount()

        if (registeredAccount) {
          const registeredEmail = String(registeredAccount.email ?? '').trim().toLowerCase()
          const registeredPassword = String(registeredAccount.password ?? '')

          if (normalizedEmail !== registeredEmail || normalizedPassword !== registeredPassword) {
            setErrors({
              password: 'Email hoặc mật khẩu không đúng.',
            })
            return
          }

          authenticatedUser = registeredAccount
        } else {
          setErrors({
            password: 'Email hoặc mật khẩu không đúng.',
          })
          return
        }
      }

      setAuthSession(authenticatedUser, authenticatedUser)
      toast.success('Đăng nhập thành công')
      navigate(getRedirectPath(), { replace: true })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__inner">
        <div className="auth-page__breadcrumb">
          <span>Trang chủ</span> <span>/</span> <strong>Đăng nhập tài khoản</strong>
        </div>

        <div className="auth-page__content">
          <h1 className="auth-page__title">ĐĂNG NHẬP TÀI KHOẢN</h1>
          <p className="auth-page__subtitle">
            Bạn chưa có tài khoản ? <Link to={ROUTES.REGISTER}>Đăng ký tại đây</Link>
          </p>

          <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
            <div className="auth-page__field">
              <label htmlFor="login-email">
                Email <span className="required">*</span>
              </label>
              <input
                id="login-email"
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

            <div className="auth-page__field">
              <label htmlFor="login-password">
                Mật khẩu <span className="required">*</span>
              </label>
              <input
                id="login-password"
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

            <button type="button" className="auth-page__forgot">
              Quên mật khẩu? Nhấn vào <span className="auth-page__forgot-link">đây</span>
            </button>

            <button type="submit" className="auth-page__submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="auth-page__divider">Hoặc đăng nhập bằng</div>

          <div className="auth-page__social">
            <button type="button" className="auth-page__social-button auth-page__social-button--facebook">
              <span>f</span>
              <em>Facebook</em>
            </button>
            <button type="button" className="auth-page__social-button auth-page__social-button--google">
              <span>G+</span>
              <em>Google</em>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
