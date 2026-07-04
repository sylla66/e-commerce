import api from './api'

export const productService = {
  list: (params) => api.get('/products', { params }).then((r) => r.data),
  getBySlug: (slug) => api.get(`/products/${slug}`).then((r) => r.data),
  create: (data) => {
    const form = data instanceof FormData ? data : new FormData()
    if (!(data instanceof FormData)) {
      Object.entries(data).forEach(([k, v]) => form.append(k, v))
    }
    return api.post('/products', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
  update: (id, data) => {
    const form = data instanceof FormData ? data : new FormData()
    if (!(data instanceof FormData)) {
      Object.entries(data).forEach(([k, v]) => form.append(k, v))
    }
    return api.patch(`/products/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
  remove: (id) => api.delete(`/products/${id}`).then((r) => r.data),
}
