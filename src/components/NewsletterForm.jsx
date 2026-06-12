import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { subscribeNewsletter } from '../services/homeApi'

const newsletterSchema = z.object({
  email: z.string().trim().email('Vui lòng nhập email hợp lệ.'),
})

export function NewsletterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values) => {
    try {
      await subscribeNewsletter(values.email)
      toast.success(`Đăng ký email thành công: ${values.email}`)
      reset()
    } catch (error) {
      console.error(error)
      toast.error('Không thể đăng ký email. Vui lòng thử lại sau.')
    }
  }

  return (
    <form className="newsletter__form" onSubmit={handleSubmit(onSubmit)}>
      <label className="sr-only" htmlFor="newsletter-email">
        Email
      </label>
      <div className="newsletter__field">
        <input
          id="newsletter-email"
          type="email"
          placeholder="Thả email nhận ngay ưu đãi.."
          aria-invalid={errors.email ? 'true' : 'false'}
          {...register('email')}
        />
        {errors.email ? <span className="newsletter__error">{errors.email.message}</span> : null}
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang gửi...' : 'Đăng ký'}
      </button>
    </form>
  )
}
