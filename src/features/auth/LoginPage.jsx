import { Link } from 'react-router-dom'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import { SectionHeading } from '../../shared/ui/SectionHeading'
import { ROUTES } from '../../config/routes'

export default function LoginPage() {
  return (
    <div className="space-y-8 py-4">
      <SectionHeading title="Đăng nhập" description="Truy cập tài khoản để theo dõi đơn hàng và mua sắm nhanh hơn" />
      <Card className="mx-auto max-w-lg space-y-4 p-6">
        <p className="text-slate-600">Trang đăng nhập đang được hoàn thiện.</p>
        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => {}}>
            Đăng nhập
          </Button>
          <Link
            to={ROUTES.REGISTER}
            className="inline-flex flex-1 items-center justify-center rounded-md border border-slate-200 px-4 py-3 font-semibold text-slate-700"
          >
            Đăng ký
          </Link>
        </div>
      </Card>
    </div>
  )
}
