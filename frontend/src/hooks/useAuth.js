import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/services/authService'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const data = await authService.login(email, password)
        localStorage.setItem('token', data.token)
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken)
        }
        set({ user: data.user, token: data.token, isAuthenticated: true })
        return data
      },

      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        set({ user: null, token: null, isAuthenticated: false })
      },

      loadProfile: async () => {
        try {
          const user = await authService.getProfile()
          set({ user, isAuthenticated: true })
          return user
        } catch {
          get().logout()
          return null
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)

export default useAuthStore
