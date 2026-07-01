import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AccountLayout from './AccountLayout'
import './account.css'
import { ROUTES } from '../../constants/routes'
import { getAuthUser } from '../../utils/authStorage'
import { loadAddresses } from '../../utils/addressStorage'
import { isNonEmpty } from '../../utils/formValidation'
import { changePassword as changeAccountPassword } from '../../services/authApi'

export default function AccountPasswordPage() {
  const navigate = useNavigate()
  const currentUser = getAuthUser()
  const addressCount = loadAddresses(currentUser).length
  const [formValues, setFormValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: '',
      }))
    }
  }

  const validate = () => {
    const nextErrors = {}

    if (!isNonEmpty(formValues.currentPassword)) {
      nextErrors.currentPassword = 'Vui lòng nhập mật khẩu cũ.'
    }

    if (!isNonEmpty(formValues.newPassword)) {
      nextErrors.newPassword = 'Vui lòng nhập mật khẩu mới.'
    } else if (String(formValues.newPassword).trim().length < 6) {
      nextErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự.'
    }

    if (!isNonEmpty(formValues.confirmPassword)) {
      nextErrors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu.'
    } else if (String(formValues.newPassword).trim() !== String(formValues.confirmPassword).trim()) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
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

    const normalizedEmail = String(currentUser?.email ?? '').trim().toLowerCase()
    const currentPassword = String(formValues.currentPassword).trim()
    const nextPassword = String(formValues.newPassword).trim()

    if (!normalizedEmail) {
      setErrors({
        currentPassword: 'Không tìm thấy tài khoản đang đăng nhập.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      try {
        await changeAccountPassword({
          email: normalizedEmail,
          currentPassword,
          newPassword: nextPassword,
          confirmPassword: String(formValues.confirmPassword).trim(),
        })
        toast.success('Đổi mật khẩu thành công')
        setFormValues({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        navigate(ROUTES.ACCOUNT, { replace: true })
      } catch (error) {
        const message = error instanceof Error && error.message ? error.message : 'Không thể đổi mật khẩu.'
        setErrors({
          currentPassword: message,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="account-page">
      <div className="account-page__inner">
        <nav className="account-page__breadcrumb" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME}>Trang chủ</Link>
          <span>/</span>
          <Link to={ROUTES.ACCOUNT}>Tài khoản</Link>
          <span>/</span>
          <strong>Thay đổi mật khẩu</strong>
        </nav>

        <AccountLayout activeMenu="password" user={currentUser} addressCount={addressCount}>
          <section className="account-page__panel">
            <h2 className="account-page__panel-title">ĐỔI MẬT KHẨU</h2>
            <p className="account-page__panel-description">
              Để đảm bảo tính bảo mật vui lòng đặt mật khẩu với ít nhất 8 kí tự
            </p>

            <form className="account-page__password-form" onSubmit={handleSubmit} noValidate>
              <label className="account-page__field">
                <span>Mật khẩu cũ <strong>*</strong></span>
                <input
                  type="password"
                  name="currentPassword"
                  value={formValues.currentPassword}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  aria-invalid={errors.currentPassword ? 'true' : 'false'}
                />
                {errors.currentPassword ? <p className="auth-page__error">{errors.currentPassword}</p> : null}
              </label>

              <label className="account-page__field">
                <span>Mật khẩu mới <strong>*</strong></span>
                <input
                  type="password"
                  name="newPassword"
                  value={formValues.newPassword}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  aria-invalid={errors.newPassword ? 'true' : 'false'}
                />
                {errors.newPassword ? <p className="auth-page__error">{errors.newPassword}</p> : null}
              </label>

              <label className="account-page__field">
                <span>Xác nhận lại mật khẩu <strong>*</strong></span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formValues.confirmPassword}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                />
                {errors.confirmPassword ? <p className="auth-page__error">{errors.confirmPassword}</p> : null}
              </label>

              <button type="submit" className="account-page__submit-button" disabled={isSubmitting}>
                {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          </section>
        </AccountLayout>
      </div>
    </div>
  )
}
