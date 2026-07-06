import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'

export function useStockMovements(params) {
  return useQuery({
    queryKey: ['stock-movements', params],
    queryFn: () => api.get('/admin/stock/movements', { params }).then((r) => r.data),
  })
}
