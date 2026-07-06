import api from './api'

export const customFieldService = {
  list: (all = false) => api.get('/admin/custom-fields', { params: { all } }).then((r) => r.data),
  getById: (id) => api.get(`/admin/custom-fields/${id}`).then((r) => r.data),
  create: (data) => api.post('/admin/custom-fields', data).then((r) => r.data),
  update: (id, data) => api.patch(`/admin/custom-fields/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/admin/custom-fields/${id}`).then((r) => r.data),
}
