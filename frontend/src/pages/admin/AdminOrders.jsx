import { useState } from 'react'
import { Package } from 'lucide-react'
import { useOrders, useOrder } from '@/hooks/useOrders'
import Button from '@/components/ui/button'

const statusLabels = {
  pending: 'En attente', confirmed: 'Confirmée', processing: 'En traitement',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
}

export default function AdminOrders() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const { data, isLoading } = useOrders({ page, limit: 20, status: statusFilter || undefined })
  const orders = data?.orders || []
  const pagination = data?.pagination || {}
  const [selected, setSelected] = useState(null)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Commandes</h1>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text">
          <option value="">Tous les statuts</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {selected ? (
        <OrderDetailAdmin orderId={selected} onBack={() => setSelected(null)} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-text-muted">
                <tr>
                  <th className="px-4 py-3">Commande</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o._id} className="bg-surface hover:bg-muted/50 cursor-pointer" onClick={() => setSelected(o._id)}>
                    <td className="px-4 py-3 font-medium text-text">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-text-muted">{o.user?.firstName} {o.user?.lastName}</td>
                    <td className="px-4 py-3 text-text">{o.totalAmount.toLocaleString()} CFA</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">{statusLabels[o.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">Voir</Button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan="6" className="px-4 py-12 text-center text-text-muted">Aucune commande</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
              <span className="px-4 py-1 text-sm text-text-muted">Page {page} / {pagination.pages}</span>
              <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function OrderDetailAdmin({ orderId, onBack }) {
  const { data: order, isLoading } = useOrder(orderId)
  const [status, setStatus] = useState('')

  if (isLoading) return <div className="animate-pulse h-48 rounded-lg bg-muted" />
  if (!order) return <div className="text-text-muted">Commande introuvable</div>

  const handleUpdateStatus = async () => {
    if (!status) return
    const { default: api } = await import('@/services/api')
    await api.patch(`/orders/${orderId}/status`, { status })
    window.location.reload()
  }

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">&larr; Retour</Button>
      <div className="mb-6 rounded-lg border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text">{order.orderNumber}</h2>
            <p className="text-sm text-text-muted">{order.user?.firstName} {order.user?.lastName} - {order.user?.email}</p>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">{statusLabels[order.status]}</span>
        </div>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-text-muted">Livraison</p>
            <p className="text-text">{order.shippingAddress.street}, {order.shippingAddress.city}</p>
            <p className="text-text-muted">{order.shippingAddress.country}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Contact</p>
            <p className="text-text">{order.user?.email}</p>
            <p className="text-text">{order.user?.phone || '—'}</p>
          </div>
        </div>

        <div className="mb-4 grid gap-2">
          <p className="text-sm text-text-muted">Changer le statut</p>
          <div className="flex gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text flex-1">
              <option value="">Sélectionner...</option>
              {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <Button size="sm" onClick={handleUpdateStatus} disabled={!status}>Mettre à jour</Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="mb-4 font-semibold text-text">Articles</h3>
        <div className="divide-y divide-border">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded bg-muted overflow-hidden">
                  {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <Package className="h-6 w-6 m-3 text-text-muted" />}
                </div>
                <div>
                  <p className="font-medium text-text">{item.name}</p>
                  <p className="text-sm text-text-muted">x{item.quantity} @ {item.unitPrice.toLocaleString()} CFA</p>
                </div>
              </div>
              <p className="font-semibold text-text">{item.totalPrice.toLocaleString()} CFA</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-text-muted"><span>Sous-total</span><span>{order.subtotal.toLocaleString()} CFA</span></div>
          <div className="flex justify-between text-text-muted"><span>Livraison</span><span>{order.shippingCost > 0 ? `${order.shippingCost.toLocaleString()} CFA` : 'Gratuite'}</span></div>
          <div className="flex justify-between font-bold text-text"><span>Total</span><span>{order.totalAmount.toLocaleString()} CFA</span></div>
        </div>
      </div>
    </div>
  )
}
