import { Link, Outlet, useLocation } from 'react-router-dom'
import { Package, Tags, LayoutDashboard, ShoppingCart } from 'lucide-react'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Produits', icon: Package },
  { to: '/admin/categories', label: 'Catégories', icon: Tags },
  { to: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
]

export default function AdminLayout() {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-border bg-surface p-6">
        <Link to="/admin" className="mb-8 block text-lg font-bold text-text">
          Administration
        </Link>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + '/')
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-text-muted hover:bg-muted hover:text-text'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
