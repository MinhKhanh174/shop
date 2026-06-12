import axios from 'axios'

const dummyJsonClient = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
})

export function fetchProducts(params) {
  return dummyJsonClient.get('/products', { params })
}

export function fetchProductCategories() {
  return dummyJsonClient.get('/products/categories')
}

export function fetchProductById(id) {
  return dummyJsonClient.get(`/products/${id}`)
}

export function searchProducts(query) {
  return dummyJsonClient.get('/products/search', {
    params: {
      q: query,
      limit: 50,
    },
  })
}

export function addProductToCart(productId, quantity = 1) {
  return dummyJsonClient.post('/carts/add', {
    userId: 1,
    products: [
      {
        id: Number(productId),
        quantity,
      },
    ],
  })
}

export function subscribeNewsletter(email) {
  return dummyJsonClient.post('/users/add', {
    firstName: 'Newsletter',
    lastName: 'Subscriber',
    email,
    username: `newsletter_${Math.random().toString(36).slice(2, 10)}`,
    password: 'newsletter123',
  })
}

/** @deprecated Use fetchProductCategories instead */
export function fetchCategories() {
  return fetchProductCategories()
}
