import api from './api'

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data),
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  getProfile: () => api.get('/auth/profile').then((r) => r.data),
  updateProfile: (data) => api.patch('/auth/profile', data).then((r) => r.data),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }).then((r) => r.data),
}
