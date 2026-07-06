import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Package, ShoppingCart, DollarSign, Users, AlertTriangle, Clock, CheckCircle, XCircle, Truck, RotateCcw } from 'lucide-react'
import api from '@/services/api'

const formatCFA = (n) => (n || 0).toLocaleString('fr-FR') + ' CFA'

const statusConfig = {
  pending: { label: 'En attente', icon: Clock, color: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-400' },
  confirmed: { label: 'Confirmée', icon: CheckCircle, color: 'bg-blue-100 text-blue-800', bar: 'bg-blue-400' },
  processing: { label: 'En traitement', icon: Truck, color: 'bg-indigo-100 text-indigo-800', bar: 'bg-indigo-400' },
  shipped: { label: 'Expédiée', icon: Truck, color: 'bg-purple-100 text-purple-800', bar: 'bg-purple-400' },
  delivered: { label: 'Livrée', icon: CheckCircle, color: 'bg-green-100 text-green-800', bar: 'bg-green-400' },
  cancelled: { label: 'Annulée', icon: XCircle, color: 'bg-red-100 text-red-800', bar: 'bg-red-400' },
  refunded: { label: 'Remboursée', icon: RotateCcw, color: 'bg-orange-100 text-orange-800', bar: 'bg-orange-400' },
}

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data),
    refetchInterval: 60000,
  })

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-text">Dashboard</h1>

      {/* Overview cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-3 inline-flex rounded-lg bg-blue-50 p-2.5 text-blue-600"><ShoppingCart className="h-5 w-5" /></div>
          <p className="text-2xl font-bold text-text">{stats?.overview?.totalOrders || 0}</p>
          <p className="text-sm text-text-muted">Commandes totales</p>
          <p className="mt-1 text-xs text-green-600">{stats?.overview?.monthOrders || 0} ce mois</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-3 inline-flex rounded-lg bg-emerald-50 p-2.5 text-emerald-600"><DollarSign className="h-5 w-5" /></div>
          <p className="text-2xl font-bold text-text">{formatCFA(stats?.overview?.totalRevenue)}</p>
          <p className="text-sm text-text-muted">Revenu total</p>
          <p className="mt-1 text-xs text-green-600">{formatCFA(stats?.overview?.monthRevenue)} ce mois</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-3 inline-flex rounded-lg bg-purple-50 p-2.5 text-purple-600"><Package className="h-5 w-5" /></div>
          <p className="text-2xl font-bold text-text">{stats?.overview?.totalProducts || 0}</p>
          <p className="text-sm text-text-muted">Produits</p>
          <p className="mt-1 text-xs text-text-muted">{stats?.overview?.totalCategories || 0} catégories</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-3 inline-flex rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><Users className="h-5 w-5" /></div>
          <p className="text-2xl font-bold text-text">{stats?.overview?.totalUsers || 0}</p>
          <p className="text-sm text-text-muted">Utilisateurs</p>
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Orders by status */}
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-4 font-semibold text-text">Commandes par statut</h2>
          <div className="space-y-3">
            {stats?.ordersByStatus && Object.entries(stats.ordersByStatus).length > 0 ? (
              Object.entries(statusConfig).map(([key, cfg]) => {
                const count = stats.ordersByStatus[key] || 0
                if (count === 0) return null
                const total = Object.values(stats.ordersByStatus).reduce((s, v) => s + v, 0)
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <cfg.icon className="h-4 w-4 text-text-muted" />
                        <span className="text-text">{cfg.label}</span>
                      </div>
                      <span className="font-medium text-text">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full transition-all ${cfg.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-text-muted">Aucune commande</p>
            )}
          </div>
        </div>

        {/* Daily sales (last 7 days) */}
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-4 font-semibold text-text">Ventes des 7 derniers jours</h2>
          {stats?.dailySales?.length > 0 ? (
            <div className="space-y-2">
              {stats.dailySales.slice(-7).map((day) => {
                const max = Math.max(...stats.dailySales.slice(-7).map((d) => d.total), 1)
                const pct = (day.total / max) * 100
                return (
                  <div key={day._id}>
                    <div className="mb-0.5 flex items-center justify-between text-sm">
                      <span className="text-text-muted">{new Date(day._id).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}</span>
                      <span className="font-medium text-text">{formatCFA(day.total)}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-text-muted">{day.count} commande{day.count > 1 ? 's' : ''}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-text-muted">Aucune vente cette année</p>
          )}
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Low stock alerts */}
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-text">Stock faible</h2>
            <Link to="/admin/products" className="text-xs text-primary hover:underline">Voir tout</Link>
          </div>
          {stats?.lowStock?.length > 0 ? (
            <div className="space-y-2">
              {stats.lowStock.map((p) => (
                <div key={p._id} className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-danger" />
                    <span className="truncate text-sm font-medium text-text">{p.name}</span>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    p.stock === 0 ? 'bg-red-200 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {p.stock}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" /> Tous les stocks sont suffisants
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-4 font-semibold text-text">Produits les plus vendus</h2>
          {stats?.topProducts?.length > 0 ? (
            <div className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-text">{p._id}</p>
                    <p className="text-xs text-text-muted">{p.totalSold} vendu{p.totalSold > 1 ? 's' : ''}</p>
                  </div>
                  <span className="text-sm font-semibold text-text">{formatCFA(p.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">Aucune vente pour le moment</p>
          )}
        </div>
      </div>
    </div>
  )
}
