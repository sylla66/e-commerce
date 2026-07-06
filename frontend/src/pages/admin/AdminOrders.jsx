import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Package, FileText, Percent, X, Download } from 'lucide-react'
import { useOrder } from '@/hooks/useOrders'
import api from '@/services/api'
import Button from '@/components/ui/button'

const statusLabels = {
  pending: 'En attente', confirmed: 'Confirmée', processing: 'En traitement',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
}

export default function AdminOrders() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const { data } = useQuery({
    queryKey: ['admin-orders', page, statusFilter],
    queryFn: () => api.get('/orders/admin', { params: { page, limit: 20, status: statusFilter || undefined } }).then((r) => r.data),
  })
  const orders = data?.orders || []
  const pagination = data?.pagination || {}
  const [selected, setSelected] = useState(null)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-text">Commandes</h1>
        <div className="flex flex-wrap items-center gap-2">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text">
            <option value="">Tous les statuts</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={() => {
            const params = new URLSearchParams()
            if (statusFilter) params.set('status', statusFilter)
            api.get(`/admin/orders/export?${params.toString()}`, { responseType: 'blob' }).then((r) => {
              const url = window.URL.createObjectURL(new Blob([r.data], { type: 'text/csv;charset=utf-8;' }))
              const a = document.createElement('a'); a.href = url; a.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`
              document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url)
            })
          }}>
            <Download className="mr-1.5 h-4 w-4" />CSV
          </Button>
        </div>
      </div>

      {selected ? (
        <OrderDetailAdmin orderId={selected} onBack={() => setSelected(null)} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-text-muted">
                  <tr>
                    <th className="px-4 py-3">Commande</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Contact</th>
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
                    <td className="px-4 py-3 text-text-muted text-sm">{o.user?.phone || o.user?.email || '—'}</td>
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
                  <tr><td colSpan="7" className="px-4 py-12 text-center text-text-muted">Aucune commande</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {orders.map((o) => (
              <div key={o._id} className="rounded-lg border border-border bg-surface p-4 cursor-pointer" onClick={() => setSelected(o._id)}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-text">{o.orderNumber}</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">{statusLabels[o.status]}</span>
                </div>
                <p className="text-sm text-text-muted">{o.user?.firstName} {o.user?.lastName}</p>
                <p className="text-xs text-text-muted">{o.user?.phone || o.user?.email}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-text-muted">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</span>
                  <span className="font-semibold text-text">{o.totalAmount.toLocaleString()} CFA</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="py-12 text-center text-text-muted">Aucune commande</p>
            )}
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
  const { data: order, isLoading, refetch } = useOrder(orderId)
  const [status, setStatus] = useState('')
  const [showCustomFields, setShowCustomFields] = useState(false)
  const [customFieldValues, setCustomFieldValues] = useState([])
  const [savingFields, setSavingFields] = useState(false)
  const { data: availableFields } = useQuery({
    queryKey: ['custom-fields-active'],
    queryFn: () => api.get('/orders/custom-fields/active').then((r) => r.data),
    enabled: showCustomFields,
  })

  if (isLoading) return <div className="animate-pulse h-48 rounded-lg bg-muted" />
  if (!order) return <div className="text-text-muted">Commande introuvable</div>

  const handleUpdateStatus = async () => {
    if (!status) return
    await api.patch(`/orders/${orderId}/status`, { status })
    window.location.reload()
  }

  const openCustomFields = () => {
    const existing = (order.customFields || []).reduce((acc, cf) => {
      acc[cf.field?._id || cf.field] = { value: cf.value, amount: cf.amount }
      return acc
    }, {})
    const values = (availableFields || []).map((f) => ({
      field: f._id,
      value: existing[f._id]?.value ?? f.defaultValue ?? '',
    }))
    setCustomFieldValues(values)
    setShowCustomFields(true)
  }

  const handleFieldChange = (fieldId, value) => {
    setCustomFieldValues((prev) =>
      prev.map((fv) => (fv.field === fieldId ? { ...fv, value } : fv))
    )
  }

  const handleSaveCustomFields = async () => {
    setSavingFields(true)
    try {
      const cleaned = customFieldValues.filter((fv) => fv.value !== '' && fv.value !== undefined)
      await api.patch(`/orders/${orderId}/custom-fields`, { customFields: cleaned })
      refetch()
      setShowCustomFields(false)
    } catch {
      alert('Erreur lors de l\'enregistrement des champs personnalisés')
    } finally {
      setSavingFields(false)
    }
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
          {(order.customFields || []).map((cf, i) => {
            const label = cf.label || cf.name
            const val = cf.type === 'percentage' ? `${cf.value}%` : `${(cf.amount || 0).toLocaleString()} CFA`
            return (
              <div key={i} className="flex justify-between text-text-muted">
                <span>{label}</span>
                <span>{val}</span>
              </div>
            )
          })}
          {order.totalSurcharges > 0 && (
            <div className="flex justify-between font-semibold text-text-muted border-t border-dashed border-border pt-1">
              <span>Suppléments</span>
              <span>{order.totalSurcharges.toLocaleString()} CFA</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-text"><span>Total</span><span>{order.totalAmount.toLocaleString()} CFA</span></div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { openCustomFields() }} disabled={!availableFields && !showCustomFields}>
            <Percent className="mr-1.5 h-4 w-4" /> Taxes / Supplém.
          </Button>
          <button onClick={() => { api.get(`/orders/${order._id}/invoice`, { responseType: 'blob' }).then((r) => { const url = window.URL.createObjectURL(new Blob([r.data])); const a = document.createElement('a'); a.href = url; a.download = `facture-${order.orderNumber}.pdf`; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url); }).catch(() => {}); }} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-muted hover:text-text hover:border-primary/30 transition-colors cursor-pointer">
            <FileText className="h-4 w-4" /> Télécharger la facture
          </button>
        </div>
      </div>

      {showCustomFields && (
        <div className="mt-6 rounded-lg border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-text">Taxes et suppléments</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowCustomFields(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {(!availableFields || availableFields.length === 0) ? (
            <p className="text-sm text-text-muted">
              Aucun champ personnalisé disponible.{' '}
              <a href="/admin/custom-fields" className="text-primary underline">Créer des champs</a>
            </p>
          ) : (
            <div className="space-y-4">
              {availableFields.map((f) => {
                const current = customFieldValues.find((fv) => fv.field === f._id)
                const val = current?.value ?? ''
                return (
                  <div key={f._id}>
                    <label className="mb-1 block text-sm font-medium text-text">
                      {f.label} {f.isRequired && <span className="text-danger">*</span>}
                      <span className="ml-2 text-xs text-text-muted">
                        ({f.type === 'percentage' ? 'Pourcentage' : f.type === 'number' ? 'Montant fixe' : f.type})
                      </span>
                    </label>
                    {f.type === 'boolean' ? (
                      <select value={val} onChange={(e) => handleFieldChange(f._id, e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text">
                        <option value="">—</option>
                        <option value="true">Oui</option>
                        <option value="false">Non</option>
                      </select>
                    ) : f.type === 'select' ? (
                      <select value={val} onChange={(e) => handleFieldChange(f._id, e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text">
                        <option value="">—</option>
                        {(f.options || []).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input type={f.type === 'number' ? 'number' : 'text'}
                        value={val}
                        onChange={(e) => handleFieldChange(f._id, e.target.value)}
                        placeholder={f.type === 'percentage' ? 'Ex: 10' : f.type === 'number' ? 'Ex: 5000' : 'Valeur'}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text" />
                    )}
                    {f.type === 'percentage' && val && (
                      <p className="mt-1 text-xs text-text-muted">
                        = {(order.subtotal * Number(val) / 100).toLocaleString()} CFA
                      </p>
                    )}
                  </div>
                )
              })}
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={handleSaveCustomFields} disabled={savingFields}>
                  {savingFields ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowCustomFields(false)}>Annuler</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
