const toneClasses = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  warning: 'bg-amber-50 text-amber-700 ring-amber-100',
  danger: 'bg-rose-50 text-rose-700 ring-rose-100',
  info: 'bg-blue-50 text-blue-700 ring-blue-100',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
}

export default function AdminBadge({ children, tone = 'neutral', className = '' }) {
  const toneClass = toneClasses[tone] ?? toneClasses.neutral

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold tracking-tight ring-1 ring-inset ${toneClass} ${className}`}
    >
      {children}
    </span>
  )
}
