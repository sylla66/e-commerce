import { Link } from 'react-router-dom'
import { Trash2, ShoppingCart, ArrowLeft } from 'lucide-react'
import useCartStore from '@/store/cartStore'
import Button from '@/components/ui/button'

export default function CartPage() {
  const { items, totalQuantity, totalAmount, updateQuantity, removeItem, clearCart } =
    useCartStore()

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-text-muted" />
        <h2 className="mb-2 text-xl font-semibold text-text">Votre panier est vide</h2>
        <p className="mb-6 text-text-muted">Ajoutez des produits pour commencer</p>
        <Link to="/products">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voir les produits
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">
          Panier ({totalQuantity} articles)
        </h1>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          <Trash2 className="mr-2 h-4 w-4" />
          Vider le panier
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.product._id}-${item.variantSku}`}
              className="flex gap-4 rounded-lg border border-border bg-surface p-4"
            >
              <Link
                to={`/products/${item.product.slug}`}
                className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted"
              >
                {item.product.images?.[0] ? (
                  <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-text-muted">
                    Pas d'image
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    to={`/products/${item.product.slug}`}
                    className="font-medium text-text hover:text-primary"
                  >
                    {item.product.name}
                  </Link>
                  {item.variantSku && (
                    <p className="text-xs text-text-muted">SKU: {item.variantSku}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-border">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.variantSku, Math.max(1, item.quantity - 1))}
                      className="px-2 py-1 text-text-muted hover:text-text"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="min-w-[2.5rem] text-center text-sm text-text">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.variantSku, item.quantity + 1)}
                      className="px-2 py-1 text-text-muted hover:text-text"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-primary">
                      {(item.price * item.quantity).toLocaleString()} CFA
                    </span>
                    <button
                      onClick={() => removeItem(item.product._id, item.variantSku)}
                      className="text-text-muted hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-lg border border-border bg-surface p-6">
          <h3 className="mb-4 text-lg font-semibold text-text">Récapitulatif</h3>
          <div className="mb-2 flex justify-between text-sm text-text-muted">
            <span>Sous-total ({totalQuantity} articles)</span>
            <span>{totalAmount.toLocaleString()} CFA</span>
          </div>
          <div className="mb-4 flex justify-between text-sm text-text-muted">
            <span>Livraison</span>
            <span>À calculer</span>
          </div>
          <div className="mb-6 flex justify-between border-t border-border pt-4 text-lg font-bold text-text">
            <span>Total</span>
            <span>{totalAmount.toLocaleString()} CFA</span>
          </div>
          <Button className="w-full" size="lg">
            Commander
          </Button>
        </div>
      </div>
    </div>
  )
}
