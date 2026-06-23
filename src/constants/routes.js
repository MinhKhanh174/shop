export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/san-pham',
  PRODUCT_DETAIL: '/san-pham/:productSlug',
  PRODUCTS_LEGACY: '/products',
  PRODUCT_DETAIL_PRODUCTS_LEGACY: '/products/:productSlug',
  CATEGORIES: '/danh-muc',
  CATEGORY_DETAIL: '/danh-muc/:categorySlug',
  CATEGORY_DETAIL_LEGACY: '/collections/:categorySlug',
  CATEGORIES_LEGACY: '/categories',
  SEARCH: '/tim-kiem',
  SEARCH_LEGACY: '/search',
  CART: '/gio-hang',
  CART_LEGACY: '/cart',
  CHECKOUT: '/thanh-toan',
  CHECKOUT_LEGACY: '/checkout',
  ACCOUNT: '/tai-khoan',
  ACCOUNT_ORDERS: '/tai-khoan/don-hang',
  ACCOUNT_ORDER_DETAIL: '/tai-khoan/don-hang/:orderId',
  ACCOUNT_PASSWORD: '/tai-khoan/doi-mat-khau',
  ACCOUNT_ADDRESS: '/tai-khoan/so-dia-chi',
  ACCOUNT_LEGACY: '/account',
  ACCOUNT_ORDERS_LEGACY: '/account/orders',
  ACCOUNT_ORDER_DETAIL_LEGACY: '/account/orders/:orderId',
  ACCOUNT_PASSWORD_LEGACY: '/account/password',
  ACCOUNT_ADDRESS_LEGACY: '/account/address',
  LOGIN: '/dang-nhap',
  LOGIN_LEGACY: '/login',
  REGISTER: '/dang-ky',
  REGISTER_LEGACY: '/register',
  STORE_SYSTEM: '/he-thong-cua-hang',
  STORE_SYSTEM_LEGACY: '/he-thong-cua-hang',
  BLOG: '/bai-viet',
  BLOG_NEWS: '/bai-viet/tin-tuc',
  BLOG_TIPS: '/bai-viet/meo-vat',
  NEWS: '/bai-viet/tin-tuc',
  TIPS: '/bai-viet/meo-vat',
  NEWS_LEGACY: '/tin-tuc',
  TIPS_LEGACY: '/meo-vat',
  BLOG_DETAIL: '/bai-viet/:articleSlug',
  BLOG_LEGACY: '/blog',
  BLOG_NEWS_LEGACY: '/blog/news',
  BLOG_TIPS_LEGACY: '/blog/tips',
  BLOG_DETAIL_LEGACY: '/blog/:articleSlug',
  GUIDE_SELL_USED: '/huong-dan-ban-may-cu',
  GUIDE_BUY_ONLINE: '/huong-dan-mua-hang-online',
  GUIDE_INSTALLMENT: '/huong-dan-tra-gop',
  COMPARE: '/so-sanh-san-pham',
  COMPARE_LEGACY: '/compare',
}

export function buildBlogCategoryPath(category) {
  return category === 'tips' ? ROUTES.BLOG_TIPS : ROUTES.BLOG_NEWS
}

export function buildSearchPath(query = '') {
  const params = new URLSearchParams()
  const normalizedQuery = String(query ?? '').trim()

  if (normalizedQuery) {
    params.set('q', normalizedQuery)
  }

  const queryString = params.toString()
  return queryString ? `${ROUTES.SEARCH}?${queryString}` : ROUTES.SEARCH
}

export function buildAccountOrderPath(orderId) {
  return `${ROUTES.ACCOUNT_ORDERS}/${encodeURIComponent(String(orderId ?? ''))}`
}
