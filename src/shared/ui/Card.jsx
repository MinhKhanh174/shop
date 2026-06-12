export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`overflow-hidden rounded-3xl bg-white shadow-sm ${className}`} {...props}>
      {children}
    </div>
  )
}
