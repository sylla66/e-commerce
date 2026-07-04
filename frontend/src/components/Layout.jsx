import { Link, Outlet } from 'react-router-dom'
import { ShoppingCart, Search, User } from 'lucide-react'
import useCartStore from '@/store/cartStore'
import useAuthStore from '@/hooks/useAuth'
import Button from '@/components/ui/button'

export default function Layout() {
  const totalQuantity = useCartStore((s) => s.totalQuantity)
  const { isAuthenticated, user, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold text-text">
            Ma Boutique
          </Link>

          <nav className="hidden items-center gap-4 sm:flex">
            <Link to="/products" className="text-sm text-text-muted hover:text-text">
              Produits
            </Link>
            <Link to="/products?category=electronique" className="text-sm text-text-muted hover:text-text">
              Électronique
            </Link>
            <Link to="/products?category=mode" className="text-sm text-text-muted hover:text-text">
              Mode
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/products">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/orders">
                  <Button variant="ghost" size="sm">Mes commandes</Button>
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      <User className="mr-1 h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={logout}>
                  Déconnexion
                </Button>
              </div>
            ) : (
              <Link to="/login">
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
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
