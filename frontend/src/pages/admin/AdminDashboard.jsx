import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Package, Tags, ShoppingCart, DollarSign, TrendingUp, CreditCard } from 'lucide-react'
import api from '@/services/api'

const formatCFA = (n) => (n || 0).toLocaleString('fr-FR') + ' CFA'

export default function AdminDashboard() {
  const { data: products } = useQuery({ queryKey: ['admin-products-count'], queryFn: () => api.get('/products?limit=1').then(r => r.data) })
  const { data: categories } = useQuery({ queryKey: ['admin-categories'], queryFn: () => api.get('/categories?all=true').then(r => r.data) })
  const { data: ordersData } = useQuery({ queryKey: ['admin-orders-all'], queryFn: () => api.get('/orders/admin?limit=500').then(r => r.data) })

  const salesStats = useMemo(() => {
    const orders = ordersData?.orders || []
    const total = orders.length
    const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0)
    const now = new Date()
    const thisMonth = orders.filter((o) => {
      const d = new Date(o.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const revenueThisMonth = thisMonth.reduce((s, o) => s + (o.totalAmount || 0), 0)
    const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'confirmed' || o.status === 'delivered')
    const avgOrder = total > 0 ? Math.round(totalRevenue / total) : 0
    return { totalRevenue, revenueThisMonth, paidCount: paidOrders.length, avgOrder }
  }, [ordersData])

  const stats = [
    { label: 'Produits', value: products?.pagination?.total ?? '—', icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'Catégories', value: categories?.length ?? '—', icon: Tags, color: 'text-purple-600 bg-purple-50' },
    { label: 'Commandes', value: ordersData?.pagination?.total ?? '—', icon: ShoppingCart, color: 'text-green-600 bg-green-50' },
    { label: 'Revenu total', value: formatCFA(salesStats.totalRevenue), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Revenu ce mois', value: formatCFA(salesStats.revenueThisMonth), icon: TrendingUp, color: 'text-orange-600 bg-orange-50' },
    { label: 'Panier moyen', value: formatCFA(salesStats.avgOrder), icon: CreditCard, color: 'text-indigo-600 bg-indigo-50' },
  ]

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-text">Dashboard</h1>
      <div className="mb-6 grid gap-6 sm:grid-cols-3">
        {stats.slice(0, 3).map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-surface p-6">
            <div className={`mb-4 inline-flex rounded-lg p-3 ${stat.color}`}><stat.icon className="h-6 w-6" /></div>
            <p className="text-2xl font-bold text-text">{stat.value}</p>
            <p className="text-sm text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {stats.slice(3).map((stat) => (
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
