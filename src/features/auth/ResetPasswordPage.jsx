import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, CircleCheckBig, Eye, EyeOff, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import './AuthPage.css'
import { ROUTES } from '../../constants/routes'
import { isNonEmpty, requiredMessage } from '../../utils/formValidation'
import { resetPassword } from '../../services/authApi'

const INVALID_LINK_MESSAGE = 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = String(searchParams.get('token') ?? '').trim()
  const email = String(searchParams.get('email') ?? '').trim().toLowerCase()
  const hasValidResetLink = Boolean(email && token)
  const linkError = hasValidResetLink ? '' : INVALID_LINK_MESSAGE
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const validate = () => {
    const nextErrors = {}

    if (!isNonEmpty(password)) {
      nextErrors.password = requiredMessage('mật khẩu mới')
    } else if (String(password).trim().length < 8) {
      nextErrors.password = 'Mật khẩu mới phải có ít nhất 8 ký tự.'
    }

    if (!isNonEmpty(confirmPassword)) {
      nextErrors.confirmPassword = requiredMessage('xác nhận mật khẩu')
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Xác nhận mật khẩu không khớp.'
    }

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!hasValidResetLink) {
      setErrors({ submit: INVALID_LINK_MESSAGE })
      return
    }

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    setSuccessMessage('')

    try {
      await resetPassword({
        token,
        email,
        password,
        passwordConfirmation: confirmPassword,
      })

      const message = 'Mật khẩu đã được cập nhật thành công.'
      setSuccessMessage(message)
      setIsSuccess(true)
      toast.success(message)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể đặt lại mật khẩu.'
      toast.error(message)
      setErrors({ submit: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="auth-page reset-password-page reset-password-page--success">
        <div className="reset-password-page__shell">
          <div className="reset-password-page__card reset-password-page__card--success">
            <div className="reset-password-page__success-icon">
              <CircleCheckBig size={34} strokeWidth={2.4} />
            </div>

            <h1 className="reset-password-page__success-title">Mật khẩu đã được cập nhật thành công.</h1>
            <p className="reset-password-page__success-subtitle">
              Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay bây giờ.
            </p>

            <Link to={ROUTES.LOGIN} className="reset-password-page__success-primary">
              <span>Đăng nhập ngay</span>
              <ArrowRight size={16} strokeWidth={2.2} />
            </Link>

            <Link to={ROUTES.HOME} className="reset-password-page__success-secondary">
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page reset-password-page">
      <div className="reset-password-page__shell">
        <div className="reset-password-page__card">
          <h1 className="reset-password-page__title">Đặt lại mật khẩu</h1>
          <p className="reset-password-page__subtitle">
            Tạo mật khẩu mới để tiếp tục sử dụng tài khoản của bạn.
          </p>

          {linkError ? <p className="reset-password-page__error reset-password-page__error--block">{linkError}</p> : null}

          <form className="reset-password-page__form" onSubmit={handleSubmit} noValidate>
            <div className="reset-password-page__field">
              <label htmlFor="reset-password-new">Mật khẩu mới</label>
              <div className="reset-password-page__input-wrap">
                <Lock size={16} strokeWidth={2} className="reset-password-page__icon reset-password-page__icon--left" />
                <input
                  id="reset-password-new"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu mới"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (errors.password) {
                      setErrors((current) => ({ ...current, password: '' }))
                    }
                  }}
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                <button
                  type="button"
                  className="reset-password-page__icon-button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                </button>
              </div>
              {errors.password ? <p className="reset-password-page__error">{errors.password}</p> : null}
            </div>

            <div className="reset-password-page__field">
              <label htmlFor="reset-password-confirm">Xác nhận mật khẩu</label>
              <div className="reset-password-page__input-wrap">
                <Lock size={16} strokeWidth={2} className="reset-password-page__icon reset-password-page__icon--left" />
                <input
                  id="reset-password-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value)
                    if (errors.confirmPassword) {
                      setErrors((current) => ({ ...current, confirmPassword: '' }))
                    }
                  }}
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                />
                <button
                  type="button"
                  className="reset-password-page__icon-button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={showConfirmPassword ? 'Ẩn xác nhận mật khẩu' : 'Hiện xác nhận mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                </button>
              </div>
              {errors.confirmPassword ? <p className="reset-password-page__error">{errors.confirmPassword}</p> : null}
            </div>

            {errors.submit ? <p className="reset-password-page__error reset-password-page__error--block">{errors.submit}</p> : null}
            {successMessage ? <p className="reset-password-page__success">{successMessage}</p> : null}

            <button type="submit" className="reset-password-page__submit" disabled={isSubmitting || !hasValidResetLink}>
              {isSubmitting ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
            </button>

            <p className="reset-password-page__back-link">
              <Link to={hasValidResetLink ? ROUTES.LOGIN : ROUTES.FORGOT_PASSWORD}>
                {hasValidResetLink ? '← Quay lại đăng nhập' : '← Quay lại gửi yêu cầu'}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
