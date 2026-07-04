import api from './api'

export const cartService = {
  get: () => api.get('/cart').then((r) => r.data),
  addItem: (productId, quantity = 1, variantSku = null) =>
    api.post('/cart/items', { productId, quantity, variantSku }).then((r) => r.data),
  updateItem: (itemId, quantity) =>
    api.patch(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`).then((r) => r.data),
  sync: (items) => api.post('/cart/sync', { items }).then((r) => r.data),
}
