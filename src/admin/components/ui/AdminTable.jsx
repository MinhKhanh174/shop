export default function AdminTable({ children, className = '' }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-slate-200 ${className}`}>{children}</table>
      </div>
    </div>
  )
}
