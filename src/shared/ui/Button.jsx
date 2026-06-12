export default function Button({ children, type = 'button', variant = 'primary', as: Component = 'button', className = '', ...props }) {
  const variants = {
    primary: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    ghost: 'bg-transparent text-slate-900 hover:bg-slate-100',
  }

  return (
    <Component
      type={Component === 'button' ? type : undefined}
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
