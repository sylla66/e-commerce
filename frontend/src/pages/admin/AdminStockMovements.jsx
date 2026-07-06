import { useState } from 'react'
import { Package, TrendingDown, TrendingUp, RotateCcw } from 'lucide-react'
import { useStockMovements } from '@/hooks/useStockMovements'
import Button from '@/components/ui/button'

const reasonLabels = {
  order_created: 'Commande créée',
  order_cancelled: 'Commande annulée',
  order_refunded: 'Remboursement',
  admin_update: 'Modification admin',
  restock: 'Réapprovisionnement',
  manual: 'Manuel',
}

export default function AdminStockMovements() {
  const [page, setPage] = useState(1)
  const [productFilter, setProductFilter] = useState('')
  const { data } = useStockMovements({ page, limit: 50, productId: productFilter || undefined })
  const movements = data?.movements || []
  const pagination = data?.pagination || {}

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-text">Historique des stocks</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Filtrer par ID produit"
            value={productFilter}
            onChange={(e) => { setProductFilter(e.target.value); setPage(1) }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text w-48"
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-text-muted">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Avant</th>
              <th className="px-4 py-3">Après</th>
              <th className="px-4 py-3">Variation</th>
              <th className="px-4 py-3">Raison</th>
              <th className="px-4 py-3">Par</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {movements.map((m) => (
              <tr key={m._id} className="bg-surface">
                <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                  {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {m.product?.images?.[0] ? (
                      <img src={m.product.images[0]} alt="" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <Package className="h-5 w-5 text-text-muted" />
                    )}
                    <span className="font-medium text-text">{m.product?.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text">{m.previousStock}</td>
                <td className="px-4 py-3 text-text">{m.newStock}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 font-medium ${m.delta > 0 ? 'text-green-600' : m.delta < 0 ? 'text-red-600' : 'text-text-muted'}`}>
                    {m.delta > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : m.delta < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : null}
                    {m.delta > 0 ? '+' : ''}{m.delta}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {reasonLabels[m.reason] || m.reason}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {m.user ? `${m.user.firstName} ${m.user.lastName}` : '—'}
                </td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr><td colSpan="7" className="px-4 py-12 text-center text-text-muted">Aucun mouvement</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {movements.map((m) => (
          <div key={m._id} className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-text-muted">{new Date(m.createdAt).toLocaleDateString('fr-FR')}</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                {reasonLabels[m.reason] || m.reason}
              </span>
            </div>
            <p className="font-medium text-text">{m.product?.name}</p>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="text-text-muted">{m.previousStock} → {m.newStock}</span>
              <span className={`inline-flex items-center gap-1 font-medium ${m.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <RotateCcw className="h-3 w-3" />
                {m.delta > 0 ? '+' : ''}{m.delta}
              </span>
            </div>
          </div>
        ))}
        {movements.length === 0 && (
          <p className="py-12 text-center text-text-muted">Aucun mouvement</p>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
          <span className="px-4 py-1 text-sm text-text-muted">Page {page} / {pagination.pages}</span>
          <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
        </div>
      )}
    </div>
  )
}
