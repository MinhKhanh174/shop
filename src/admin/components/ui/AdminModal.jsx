import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function AdminModal({
  open = false,
  title = '',
  description = '',
  onClose,
  children,
  footer,
  sizeClassName = 'max-w-5xl',
}) {
  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, open])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <button
        type="button"
        aria-label="Đóng hộp thoại"
        className="absolute inset-0"
        onClick={() => {
          onClose?.()
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'admin-modal-title' : undefined}
        className={`relative z-[61] flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] ${sizeClassName}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            {title ? (
              <h2 id="admin-modal-title" className="text-xl font-semibold tracking-tight text-slate-950">
                {title}
              </h2>
            ) : null}
            {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>

          <button
            type="button"
            onClick={() => {
              onClose?.()
            }}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            aria-label="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer ? <div className="border-t border-slate-100 px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  )
}
