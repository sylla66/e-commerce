import api from './api'

export const orderService = {
  create: (data) => api.post('/orders', data).then((r) => r.data),
  list: (params) => api.get('/orders', { params }).then((r) => r.data),
  getById: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  createPaymentIntent: (id, provider = 'stripe') => api.post(`/orders/${id}/pay`, { provider }).then((r) => r.data),
  confirmPayment: (paymentId, provider) => api.post('/orders/confirm-payment', { paymentId, provider }).then((r) => r.data),
}
