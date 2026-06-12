export default function Card({ children, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  )
}
