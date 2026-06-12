export function formatCurrency(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '0đ'
  }

  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

export function formatPercent(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '0%'
  }

  return `${value > 0 ? '+' : ''}${value}%`
}
