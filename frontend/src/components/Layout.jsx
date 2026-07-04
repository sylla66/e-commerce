import { Link, Outlet } from 'react-router-dom'
import { ShoppingCart, Search } from 'lucide-react'
import useCartStore from '@/store/cartStore'
import Button from '@/components/ui/button'

export default function Layout() {
  const totalQuantity = useCartStore((s) => s.totalQuantity)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold text-text">
            Ma Boutique
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              to="/products"
              className="text-sm text-text-muted hover:text-text"
            >
              Produits
            </Link>
            <Link
              to="/products?category=electronique"
              className="text-sm text-text-muted hover:text-text"
            >
              Électronique
            </Link>
            <Link
              to="/products?category=mode"
              className="text-sm text-text-muted hover:text-text"
            >
              Mode
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/products">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
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
