import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Package } from 'lucide-react'
import { useOrder } from '@/hooks/useOrders'
import Button from '@/components/ui/button'

const statusLabels = {
  pending: 'En attente', confirmed: 'Confirmée', processing: 'En traitement',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const { data: order, isLoading } = useOrder(id)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="h-32 rounded-lg bg-muted" />
        <div className="h-24 rounded-lg bg-muted" />
      </div>
    )
  }

  if (!order) {
    return <div className="py-12 text-center text-text-muted">Commande introuvable</div>
  }

  return (
    <div className="max-w-3xl">
      <Link to="/orders" className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text">
        <ArrowLeft className="h-4 w-4" /> Mes commandes
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">{order.orderNumber}</h1>
          <p className="text-sm text-text-muted">{new Date(order.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">{statusLabels[order.status]}</span>
      </div>

      <div className="mb-6 rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 font-semibold text-text">Livraison</h2>
        <p className="text-text">{order.shippingAddress.street}</p>
        <p className="text-text-muted">{order.shippingAddress.city}{order.shippingAddress.region ? `, ${order.shippingAddress.region}` : ''} - {order.shippingAddress.country}</p>
        {order.trackingNumber && <p className="mt-2 text-sm text-primary">Suivi : {order.trackingNumber}</p>}
        {order.estimatedDelivery && <p className="text-sm text-text-muted">Livraison estimée : {new Date(order.estimatedDelivery).toLocaleDateString('fr-FR')}</p>}
      </div>

      <div className="mb-6 rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 font-semibold text-text">Articles ({order.items.length})</h2>
        <div className="divide-y divide-border">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-text-muted"><Package className="h-6 w-6" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text truncate">{item.name}</p>
                <p className="text-sm text-text-muted">x{item.quantity}</p>
              </div>
              <p className="font-semibold text-text">{item.totalPrice.toLocaleString()} CFA</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-text-muted"><span>Sous-total</span><span>{order.subtotal.toLocaleString()} CFA</span></div>
          <div className="flex justify-between text-text-muted"><span>Livraison</span><span>{order.shippingCost > 0 ? `${order.shippingCost.toLocaleString()} CFA` : 'Gratuite'}</span></div>
          {order.taxAmount > 0 && <div className="flex justify-between text-text-muted"><span>Taxes</span><span>{order.taxAmount.toLocaleString()} CFA</span></div>}
          <div className="flex justify-between border-t border-border pt-2 font-bold text-text"><span>Total</span><span>{order.totalAmount.toLocaleString()} CFA</span></div>
        </div>
      </div>
    </div>
  )
}
