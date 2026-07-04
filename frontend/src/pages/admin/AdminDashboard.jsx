import { Package, Tags, ShoppingCart } from 'lucide-react'

const stats = [
  { label: 'Produits', value: '—', icon: Package, color: 'text-blue-600 bg-blue-50' },
  { label: 'Catégories', value: '—', icon: Tags, color: 'text-purple-600 bg-purple-50' },
  { label: 'Commandes', value: '—', icon: ShoppingCart, color: 'text-green-600 bg-green-50' },
]

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-text">Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-surface p-6">
            <div className={`mb-4 inline-flex rounded-lg p-3 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold text-text">{stat.value}</p>
            <p className="text-sm text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
