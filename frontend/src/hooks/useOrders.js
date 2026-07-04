import { useQuery } from '@tanstack/react-query'
import { orderService } from '@/services/orderService'

export function useOrders(params) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.list(params),
  })
}

export function useOrder(id) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  })
}
