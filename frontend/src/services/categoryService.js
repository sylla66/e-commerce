import api from './api'

export const categoryService = {
  getAll: (all = false) => api.get('/categories', { params: { all } }).then((r) => r.data),
  getBySlug: (slug) => api.get(`/categories/${slug}`).then((r) => r.data),
  create: (data) => api.post('/categories', data).then((r) => r.data),
  update: (id, data) => api.patch(`/categories/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
}
