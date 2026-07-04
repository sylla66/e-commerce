import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { ShoppingCart, Search, User, Menu, X } from 'lucide-react'
import useCartStore from '@/store/cartStore'
import useAuthStore from '@/hooks/useAuth'
import Button from '@/components/ui/button'

export default function Layout() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const totalQuantity = useCartStore((s) => s.totalQuantity)
  const { isAuthenticated, user, logout } = useAuthStore()

  const navLinks = [
    { to: '/products', label: 'Produits' },
    { to: '/products?category=electronique', label: 'Électronique' },
    { to: '/products?category=mode', label: 'Mode' },
    ...(isAuthenticated ? [{ to: '/orders', label: 'Mes commandes' }] : []),
    ...(isAuthenticated && user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold text-text">
            Ma Boutique
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            <Link to="/products" className="text-sm text-text-muted hover:text-text">Produits</Link>
            <Link to="/products?category=electronique" className="text-sm text-text-muted hover:text-text">Électronique</Link>
            <Link to="/products?category=mode" className="text-sm text-text-muted hover:text-text">Mode</Link>
            {isAuthenticated && (
              <Link to="/orders" className="text-sm text-text-muted hover:text-text">Mes commandes</Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="text-sm text-text-muted hover:text-text">Admin</Link>
            )}
          </nav>

          <div className="flex items-center gap-1">
            <Link to="/products">
              <Button variant="ghost" size="icon"><Search className="h-5 w-5" /></Button>
            </Link>

            {isAuthenticated ? (
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={logout}>Déconnexion</Button>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm">Connexion</Button>
              </Link>
            )}

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {totalQuantity > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {totalQuantity > 99 ? '99+' : totalQuantity}
                </span>
              )}
            </Link>

            <button onClick={() => setMobileMenu(!mobileMenu)} className="ml-1 md:hidden text-text-muted hover:text-text">
              {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="border-t border-border bg-surface px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileMenu(false)}
                  className="rounded-lg px-3 py-2 text-sm text-text hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border pt-2 mt-1">
                {isAuthenticated ? (
                  <button onClick={() => { logout(); setMobileMenu(false) }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-muted"
                  >
                    Déconnexion
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setMobileMenu(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-primary hover:bg-muted"
                  >
                    Connexion
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
