export function buildArticleThumb(seed, tones) {
  const [base, accent] = tones
  const label = seed
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${base}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" rx="14" fill="url(#g)" />
      <circle cx="120" cy="32" r="24" fill="rgba(255,255,255,0.22)" />
      <rect x="18" y="70" width="64" height="14" rx="7" fill="rgba(255,255,255,0.35)" />
      <rect x="18" y="90" width="108" height="10" rx="5" fill="rgba(255,255,255,0.25)" />
      <text x="16" y="31" font-size="18" font-family="Lato, sans-serif" font-weight="700" fill="#fff">${label}</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
