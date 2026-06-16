import { Copy } from 'lucide-react'
import toast from 'react-hot-toast'

export function CopyCodeButton({ value, children = 'Sao chép', className = '', successMessage, showIcon = false }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(successMessage ?? `Đã sao chép mã ${value}`)
    } catch {
      toast.error('Không thể sao chép mã')
    }
  }

  return (
    <button type="button" className={className} onClick={handleCopy}>
      {showIcon ? <Copy size={14} /> : null}
      <span>{children}</span>
    </button>
  )
}
