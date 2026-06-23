import { getProductDetailPath } from './productRoutes'

const techCategoryMap = {
  featured: [],
  phone: ['smartphones'],
  tablet: ['tablets'],
  headphones: ['headphones'],
  watch: ['mens-watches', 'womens-watches'],
  battery: ['mobile-accessories'],
  speaker: ['speakers'],
  case: ['mobile-accessories'],
  charger: ['mobile-accessories'],
  accessories: ['mobile-accessories', 'computer-accessories'],
  smartphones: ['smartphones'],
  tablets: ['tablets'],
  'womens-watches': ['womens-watches'],
  'mens-watches': ['mens-watches'],
  laptops: ['laptops'],
  'mobile-accessories': ['mobile-accessories'],
  fragrances: ['fragrances'],
  skincare: ['skincare'],
  'skin-care': ['skin-care'],
  groceries: ['groceries'],
  'home-decoration': ['home-decoration'],
  furniture: ['furniture'],
  tops: ['tops'],
  'womens-dresses': ['womens-dresses'],
  'womens-shoes': ['womens-shoes'],
  'mens-shirts': ['mens-shirts'],
  'mens-shoes': ['mens-shoes'],
  'womens-bags': ['womens-bags'],
  'womens-jewellery': ['womens-jewellery'],
  sunglasses: ['sunglasses'],
  automotive: ['automotive'],
  motorcycle: ['motorcycle'],
  lighting: ['lighting'],
  beauty: ['beauty'],
  'kitchen-accessories': ['kitchen-accessories'],
  'sports-accessories': ['sports-accessories'],
  vehicle: ['vehicle'],
}

const brandPriority = ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Realme', 'Sony', 'LG', 'Huawei', 'Vivo', 'JBL', 'Anker']

const fallbackSectionTitle = {
  featured: 'Khuyến mãi hot',
  phone: 'Điện thoại',
  tablet: 'Máy tính bảng',
  headphones: 'Tai nghe',
  watch: 'Smart Watch',
  battery: 'Sạc dự phòng',
  speaker: 'Loa bluetooth',
  case: 'Ốp lưng',
  charger: 'Củ sạc',
  accessories: 'Phụ kiện',
  smartphones: 'Điện thoại',
  tablets: 'Máy tính bảng',
  'womens-watches': 'Đồng hồ nữ',
  'mens-watches': 'Đồng hồ nam',
  laptops: 'Laptop',
  'mobile-accessories': 'Phụ kiện điện thoại',
  fragrances: 'Nước hoa',
  skincare: 'Chăm sóc da',
  'skin-care': 'Chăm sóc da',
  groceries: 'Đồ ăn',
  'home-decoration': 'Trang trí nhà',
  furniture: 'Đồ nội thất',
  tops: 'Áo',
  'womens-dresses': 'Váy nữ',
  'womens-shoes': 'Giày nữ',
  'mens-shirts': 'Áo nam',
  'mens-shoes': 'Giày nam',
  'womens-bags': 'Túi xách nữ',
  'womens-jewellery': 'Trang sức nữ',
  sunglasses: 'Kính mát',
  automotive: 'Ô tô',
  motorcycle: 'Xe máy',
  lighting: 'Đèn',
  beauty: 'Mỹ phẩm',
  'kitchen-accessories': 'Phụ kiện bếp',
  'sports-accessories': 'Phụ kiện thể thao',
  vehicle: 'Xe cộ',
}

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function matchProductsForCategory(remoteProducts, categoryKey) {
  const allowedCategories = techCategoryMap[categoryKey] ?? []

  if (!allowedCategories.length) {
    return []
  }

  return remoteProducts.filter((product) => allowedCategories.includes(normalize(product.category)))
}

function uniqueBrands(products) {
  const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))]

  return [...brandPriority.filter((brand) => brands.includes(brand)), ...brands.filter((brand) => !brandPriority.includes(brand))]
}

function makeGroupTitle(categoryKey, brand) {
  const sectionTitle = fallbackSectionTitle[categoryKey] ?? 'Danh mục'
  return `${sectionTitle} ${brand}`.trim()
}

function makeLink(product) {
  return getProductDetailPath(product)
}

export function buildCategoryMegaGroups(remoteProducts, categoryKey) {
  if (categoryKey === 'featured') {
    const discounted = [...remoteProducts]
      .filter((product) => typeof product.discountPercentage === 'number' && product.discountPercentage > 0)
      .sort((left, right) => right.discountPercentage - left.discountPercentage)
      .slice(0, 9)

    return [
      {
        title: 'Khuyến mãi hot',
        items:
          discounted.length > 0
            ? discounted.map((product) => ({
                label: product.title,
                href: makeLink(product),
              }))
            : [
                {
                  label: 'Không có khuyến mãi nào',
                  href: '#',
                },
              ],
      },
    ]
  }

  const categoryProducts = matchProductsForCategory(remoteProducts, categoryKey)

  if (!categoryProducts.length) {
    return [
      {
        title: fallbackSectionTitle[categoryKey] || 'Danh mục',
        items: [
          {
            label: 'Không có sản phẩm nào',
            href: '#',
          },
        ],
      },
    ]
  }

  return uniqueBrands(categoryProducts).map((brand) => {
    const products = categoryProducts.filter((product) => normalize(product.brand) === normalize(brand)).slice(0, 6)

    return {
      title: makeGroupTitle(categoryKey, brand),
      items: products.map((product) => ({
        label: product.title,
        href: makeLink(product),
        brand,
      })),
    }
  })
}
