import {
  AlertTriangle,
  BarChart3,
  Boxes,
  ChevronRight,
  Image,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Package,
  Settings2,
  ShoppingCart,
  Sparkles,
  Tag,
  TicketPercent,
  UserCircle2,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import logoSrc from '../../assets/logo.webp'

const menuGroups = [
  {
    title: 'Tổng quan',
    items: [{ label: 'Tổng quan', to: '/admin/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Quản lý cửa hàng',
    items: [
      { label: 'Sản phẩm', to: '/admin/products', icon: Package },
      { label: 'Danh mục', disabled: true, icon: Tag },
      { label: 'Thương hiệu', disabled: true, icon: Sparkles },
      { label: 'Đơn hàng', to: '/admin/orders', icon: ShoppingCart },
      { label: 'Khách hàng', to: '/admin/users', icon: Users },
    ],
  },
  {
    title: 'Quản lý kho',
    items: [
      { label: 'Tồn kho', disabled: true, icon: Boxes },
      { label: 'Sản phẩm sắp hết', disabled: true, icon: AlertTriangle },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { label: 'Voucher', disabled: true, icon: TicketPercent },
      { label: 'Banner', disabled: true, icon: Image },
    ],
  },
  {
    title: 'Báo cáo',
    items: [{ label: 'Thống kê', disabled: true, icon: BarChart3 }],
  },
  {
    title: 'Cài đặt',
    items: [{ label: 'Cài đặt', to: '/admin/settings', icon: Settings2 }],
  },
  {
    title: 'Tài khoản',
    items: [
      { label: 'Hồ sơ', disabled: true, icon: UserCircle2 },
      { label: 'Đổi mật khẩu', disabled: true, icon: KeyRound },
      { label: 'Đăng xuất', action: 'logout', icon: LogOut },
    ],
  },
]

function SidebarItem({ item, onLogout, onNavigate }) {
  const Icon = item.icon

  if (item.action === 'logout') {
    return (
      <button
        type="button"
        onClick={() => {
          onNavigate?.()
          onLogout?.()
        }}
        className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-rose-600 transition-all hover:bg-rose-50"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 transition-colors group-hover:bg-rose-100">
          <Icon size={17} />
        </span>
        <span className="flex-1">Đăng xuất</span>
      </button>
    )
  }

  if (item.disabled) {
    return (
      <button
        type="button"
        disabled
        className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-400"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Icon size={17} />
        </span>
        <span className="flex-1">{item.label}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Sắp có
        </span>
      </button>
    )
  }

  return (
    <NavLink
      to={item.to}
      end
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all',
          isActive
            ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-inset ring-blue-100'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
        ].join(' ')
      }
      onClick={onNavigate}
    >
      {({ isActive }) => (
        <>
          <span
            className={[
              'flex h-9 w-9 items-center justify-center rounded-2xl transition-colors',
              isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600',
            ].join(' ')}
          >
            <Icon size={17} />
          </span>
          <span className="flex-1">{item.label}</span>
          <ChevronRight size={15} className={isActive ? 'text-blue-500' : 'text-slate-300'} />
        </>
      )}
    </NavLink>
  )
}

export default function AdminSidebar({ open = false, onClose, onLogout }) {
  const sidebarShell =
    'fixed inset-y-0 left-0 z-50 w-[260px] shrink-0 border-r border-slate-200 bg-white text-slate-800 shadow-[8px_0_30px_rgba(15,23,42,0.04)] transition-transform duration-200 ease-out lg:translate-x-0'

  return (
    <>
      <aside className={`${sidebarShell} ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex h-16 items-center border-b border-slate-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
              <img src={logoSrc} alt="TechStore" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">TechStore Admin</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Bảng điều khiển</p>
            </div>
          </div>
        </div>

        <nav className="flex h-[calc(100vh-4rem)] flex-col gap-3 overflow-y-auto px-3 py-4">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.label}
                    item={item}
                    onLogout={onLogout}
                    onNavigate={() => {
                      if (window.innerWidth < 1024) {
                        onClose?.()
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Đóng menu quản trị"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/25 lg:hidden"
        />
      ) : null}
    </>
  )
}
