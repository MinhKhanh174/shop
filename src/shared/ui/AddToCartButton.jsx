export function AddToCartButton({
  children,
  className = '',
  disabled = false,
  loading = false,
  icon: Icon = null,
  onClick,
  ariaLabel,
  title,
  type = 'button',
}) {
  const isDisabled = disabled || loading

  return (
    <button type={type} className={className} onClick={onClick} disabled={isDisabled} aria-label={ariaLabel} title={title}>
      {Icon ? <Icon size={16} aria-hidden="true" /> : null}
      {children}
    </button>
  )
}
