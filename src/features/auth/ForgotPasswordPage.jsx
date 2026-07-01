import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import './AuthPage.css'
import { ROUTES } from '../../constants/routes'
import { forgotPassword } from '../../services/authApi'
import { isValidEmail, requiredMessage, isNonEmpty } from '../../utils/formValidation'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const validate = () => {
    const nextErrors = {}

    if (!isNonEmpty(email)) {
      nextErrors.email = requiredMessage('email')
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Email không hợp lệ.'
    }

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)
    setSuccessMessage('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await forgotPassword(email)

      const message = 'Vui lòng xác nhận qua email để tiếp tục.'
      setSuccessMessage(message)
      toast.success(message)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.'
      toast.error(message)
      setErrors({ submit: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__inner">
        <div className="auth-page__breadcrumb">
          <span>Trang chủ</span> <span>/</span> <strong>Quên mật khẩu</strong>
        </div>

        <div className="auth-page__content">
          <h1 className="auth-page__title">QUÊN MẬT KHẨU</h1>
          <p className="auth-page__subtitle">
            Nhập email của bạn, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu nếu tài khoản hợp lệ.
          </p>

          <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
            <div className="auth-page__field">
              <label htmlFor="forgot-password-email">
                Email <span className="required">*</span>
              </label>
              <input
                id="forgot-password-email"
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

            {errors.submit ? <p className="auth-page__error auth-page__error--block">{errors.submit}</p> : null}
            {successMessage ? <p className="auth-page__success">{successMessage}</p> : null}

            <button type="submit" className="auth-page__submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xác nhận...' : 'Xác nhận mail'}
            </button>
          </form>

          <p className="auth-page__back-link">
            <Link to={ROUTES.LOGIN}>← Quay lại đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
