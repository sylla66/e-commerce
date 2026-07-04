import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Phone, Mail, ChevronLeft, FileText } from 'lucide-react'
import api from '@/services/api'
import Button from '@/components/ui/button'
import useAuthStore from '@/hooks/useAuth'

const statusLabels = {
  pending: 'En attente', confirmed: 'Confirmée', processing: 'En traitement',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
}

export default function ManagerOrders() {
  const user = useAuthStore((s) => s.user)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const { data, isLoading } = useQuery({
    queryKey: ['manager-orders', page, statusFilter],
    queryFn: () => api.get('/orders/admin', { params: { page, limit: 20, status: statusFilter || undefined } }).then((r) => r.data),
    enabled: !!user,
  })
  const orders = data?.orders || []
  const pagination = data?.pagination || {}
  const [selected, setSelected] = useState(null)

  if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
    return <p className="text-center text-text-muted py-12">Accès non autorisé</p>
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Gestion des commandes</h1>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text">
          <option value="">Tous les statuts</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {selected ? (
        <ManagerOrderDetail orderId={selected} onBack={() => setSelected(null)} />
      ) : (
        <>
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-border">
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
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(o.status)}`}>{statusLabels[o.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">Gérer</Button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan="6" className="px-4 py-12 text-center text-text-muted">Aucune commande</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 sm:hidden">
            {orders.map((o) => (
              <div key={o._id} className="rounded-lg border border-border bg-surface p-4 cursor-pointer" onClick={() => setSelected(o._id)}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-text">{o.orderNumber}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(o.status)}`}>{statusLabels[o.status]}</span>
                </div>
                <p className="text-sm text-text-muted">{o.user?.firstName} {o.user?.lastName}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-text-muted">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</span>
                  <span className="font-semibold text-text">{o.totalAmount.toLocaleString()} CFA</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="py-12 text-center text-text-muted">Aucune commande</p>}
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

function ManagerOrderDetail({ orderId, onBack }) {
  const queryClient = useQueryClient()
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.get(`/orders/${orderId}`).then((r) => r.data),
  })
  const [status, setStatus] = useState('')

  const updateStatus = useMutation({
    mutationFn: (newStatus) => api.patch(`/orders/${orderId}/status`, { status: newStatus }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['order', orderId] }); queryClient.invalidateQueries({ queryKey: ['manager-orders'] }); setStatus('') },
  })

  if (isLoading) return <div className="animate-pulse h-48 rounded-lg bg-muted" />
  if (!order) return <div className="text-text-muted">Commande introuvable</div>

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4"><ChevronLeft className="mr-1 h-4 w-4" /> Retour</Button>

      <div className="mb-6 rounded-lg border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text">{order.orderNumber}</h2>
            <p className="text-sm text-text-muted">{order.user?.firstName} {order.user?.lastName}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor(order.status)}`}>{statusLabels[order.status]}</span>
        </div>

        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-text-muted">Livraison</p>
            <p className="text-text">{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
            <p className="text-text-muted">{order.shippingAddress?.country}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted">Contact client</p>
            <p className="text-text">{order.user?.email}</p>
            <p className="text-text">{order.user?.phone || '—'}</p>
          </div>
          <div className="flex items-end gap-2">
            {order.user?.email && (
              <a href={`mailto:${order.user.email}`} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary hover:bg-primary/20">
                <Mail className="h-4 w-4" /> Email
              </a>
            )}
            {order.user?.phone && (
              <a href={`tel:${order.user.phone}`} className="inline-flex items-center gap-1 rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700 hover:bg-green-200">
                <Phone className="h-4 w-4" /> Appeler
              </a>
            )}
          </div>
        </div>

        <div className="mb-4 grid gap-2">
          <p className="text-sm text-text-muted">Changer le statut</p>
          <div className="flex gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text flex-1">
              <option value="">Sélectionner...</option>
              {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <Button size="sm" onClick={() => updateStatus.mutate(status)} disabled={!status || updateStatus.isPending}>
              {updateStatus.isPending ? '...' : 'Mettre à jour'}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="mb-4 font-semibold text-text">Articles</h3>
        <div className="divide-y divide-border">
          {order.items?.map((item, i) => (
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
          <div className="flex justify-between text-text-muted"><span>Sous-total</span><span>{order.subtotal?.toLocaleString()} CFA</span></div>
          <div className="flex justify-between text-text-muted"><span>Livraison</span><span>{order.shippingCost > 0 ? `${order.shippingCost.toLocaleString()} CFA` : 'Gratuite'}</span></div>
          <div className="flex justify-between font-bold text-text"><span>Total</span><span>{order.totalAmount?.toLocaleString()} CFA</span></div>
        </div>
        <button onClick={() => { api.get(`/orders/${order._id}/invoice`, { responseType: 'blob' }).then((r) => { const url = window.URL.createObjectURL(new Blob([r.data])); const a = document.createElement('a'); a.href = url; a.download = `facture-${order.orderNumber}.pdf`; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url); }).catch(() => {}); }} className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-muted hover:text-text hover:border-primary/30 transition-colors cursor-pointer">
          <FileText className="h-4 w-4" /> Télécharger la facture
        </button>
      </div>
    </div>
  )
}

function statusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
