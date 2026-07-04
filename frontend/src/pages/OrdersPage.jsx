import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'
import Button from '@/components/ui/button'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  pending: 'En attente', confirmed: 'Confirmée', processing: 'En traitement',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
}

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useOrders({ page, limit: 10 })
  const orders = data?.orders || []
  const pagination = data?.pagination || {}

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text">Mes commandes</h1>

      {orders.length === 0 && !isLoading && (
        <div className="py-12 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-text-muted" />
          <p className="text-text-muted">Aucune commande pour le moment</p>
          <Link to="/products"><Button className="mt-4">Découvrir nos produits</Button></Link>
        </div>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <Link key={order._id} to={`/orders/${order._id}`} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4 hover:shadow-sm transition-shadow">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text">{order.orderNumber}</p>
              <p className="text-sm text-text-muted">{order.items.length} article(s) - {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-text">{order.totalAmount.toLocaleString()} CFA</p>
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status]}`}>{statusLabels[order.status]}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-text-muted" />
          </Link>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
          <span className="px-4 py-1 text-sm text-text-muted">Page {page} / {pagination.pages}</span>
          <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
        </div>
      )}
    </div>
  )
}
