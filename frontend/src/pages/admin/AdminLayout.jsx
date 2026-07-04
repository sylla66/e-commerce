import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Package, Tags, LayoutDashboard, ShoppingCart, Users, Activity, Menu, X, LogOut, ArrowLeft } from 'lucide-react'
import useAuthStore from '@/hooks/useAuth'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Produits', icon: Package },
  { to: '/admin/categories', label: 'Catégories', icon: Tags },
  { to: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users },
  { to: '/admin/activities', label: 'Activités', icon: Activity },
]

export default function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    navigate('/products')
  }

  const NavLinks = () => navItems.map((item) => {
    const active = pathname === item.to || pathname.startsWith(item.to + '/')
    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={() => setSidebarOpen(false)}
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
  })

  return (
    <div className="flex min-h-screen">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar desktop + drawer mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/admin" className="text-lg font-bold text-text">
              Administration
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-text-muted hover:text-text">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-2">
            <NavLinks />
          </nav>
        </div>
        <div className="mt-auto border-t border-border p-4 space-y-2">
          <Link to="/products" onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-text-muted hover:bg-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la boutique
          </Link>
          <button onClick={() => { handleLogout(); setSidebarOpen(false) }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-8">
        <button onClick={() => setSidebarOpen(true)} className="mb-4 lg:hidden text-text-muted hover:text-text">
          <Menu className="h-6 w-6" />
        </button>
        <Outlet />
      </main>
    </div>
  )
}
