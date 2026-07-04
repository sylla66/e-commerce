import { useQuery } from '@tanstack/react-query'
import { Package, Tags, ShoppingCart, DollarSign } from 'lucide-react'
import api from '@/services/api'

export default function AdminDashboard() {
  const { data: products } = useQuery({ queryKey: ['admin-products-count'], queryFn: () => api.get('/products?limit=1').then(r => r.data) })
  const { data: categories } = useQuery({ queryKey: ['admin-categories'], queryFn: () => api.get('/categories?all=true').then(r => r.data) })
  const { data: orders } = useQuery({ queryKey: ['admin-orders-count'], queryFn: () => api.get('/orders/admin?limit=1').then(r => r.data) })

  const stats = [
    { label: 'Produits', value: products?.pagination?.total ?? '—', icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'Catégories', value: categories?.length ?? '—', icon: Tags, color: 'text-purple-600 bg-purple-50' },
    { label: 'Commandes', value: orders?.pagination?.total ?? '—', icon: ShoppingCart, color: 'text-green-600 bg-green-50' },
  ]

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-text">Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-surface p-6">
            <div className={`mb-4 inline-flex rounded-lg p-3 ${stat.color}`}><stat.icon className="h-6 w-6" /></div>
            <p className="text-2xl font-bold text-text">{stat.value}</p>
            <p className="text-sm text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
