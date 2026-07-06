import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Package, TrendingDown, TrendingUp, Activity, UserCircle, ShoppingCart, RotateCcw, Trash2, Plus, Edit3, AlertCircle, RefreshCw, X, ExternalLink, Clock, Hash, DollarSign, Tag, Info } from 'lucide-react'
import api from '@/services/api'
import Button from '@/components/ui/button'

const tabs = [
  { id: 'all', label: 'Tout', icon: RefreshCw },
  { id: 'activity', label: 'Activités', icon: Activity },
  { id: 'stock', label: 'Stocks', icon: Package },
]

const actionIcons = {
  update_status: ShoppingCart, contact_customer: UserCircle, note_added: Edit3,
  tracking_added: Edit3, custom_fields_updated: Edit3, invoice_downloaded: Activity,
  product_created: Plus, product_updated: Edit3, product_deleted: Trash2,
  category_created: Plus, category_updated: Edit3, category_deleted: Trash2,
  stock_updated: TrendingUp, user_created: Plus, user_updated: Edit3,
  order_created: TrendingDown, order_cancelled: TrendingUp, order_refunded: TrendingUp,
  admin_update: Edit3, restock: Plus, manual: Edit3,
}

const actionColors = {
  update_status: 'bg-blue-100 text-blue-700',
  contact_customer: 'bg-purple-100 text-purple-700',
  note_added: 'bg-yellow-100 text-yellow-700',
  product_created: 'bg-green-100 text-green-700',
  product_updated: 'bg-blue-100 text-blue-700',
  product_deleted: 'bg-red-100 text-red-700',
  stock_updated: 'bg-orange-100 text-orange-700',
  order_created: 'bg-red-100 text-red-700',
  order_cancelled: 'bg-green-100 text-green-700',
  order_refunded: 'bg-green-100 text-green-700',
  admin_update: 'bg-orange-100 text-orange-700',
  restock: 'bg-green-100 text-green-700',
  user_created: 'bg-indigo-100 text-indigo-700',
  user_updated: 'bg-blue-100 text-blue-700',
}

function getActionLabel(entry) {
  if (entry.type === 'stock') {
    const labels = {
      order_created: 'Sortie stock', order_cancelled: 'Retour stock',
      order_refunded: 'Remb. stock', admin_update: 'Ajustement',
      restock: 'Réapprovisionnement', manual: 'Manuel',
    }
    return labels[entry.reason] || entry.reason
  }
  const labels = {
    update_status: 'Statut commande', contact_customer: 'Contact client',
    note_added: 'Note ajoutée', tracking_added: 'Suivi ajouté',
    custom_fields_updated: 'Champs mis à jour', invoice_downloaded: 'Facture',
    product_created: 'Produit créé', product_updated: 'Produit modifié',
    product_deleted: 'Produit supprimé', category_created: 'Catégorie créée',
    category_updated: 'Catégorie modifiée', category_deleted: 'Catégorie supprimée',
    stock_updated: 'Stock ajusté', user_created: 'Utilisateur créé',
    user_updated: 'Utilisateur modifié',
  }
  return labels[entry.action] || entry.action
}

export default function AdminInventory() {
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventory', page, activeTab, search],
    queryFn: () => api.get('/admin/inventory', {
      params: { page, limit: 40, type: activeTab === 'all' ? undefined : activeTab, search: search || undefined },
    }).then((r) => r.data),
  })

  const entries = data?.entries || []
  const pagination = data?.pagination || {}

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Inventaire</h1>
          <p className="text-sm text-text-muted">
            {pagination.total > 0
              ? `${pagination.total} événement${pagination.total > 1 ? 's' : ''}`
              : 'Aucun événement enregistré'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Rechercher..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text w-48" />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setPage(1); setSelected(null) }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'}`}>
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.id === 'all' && pagination.total > 0 && (
                <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">{pagination.total}</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex gap-6">
        {/* Timeline */}
        <div className={`flex-1 min-w-0 ${selected ? 'hidden lg:block' : ''}`}>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 rounded bg-muted" />
                      <div className="h-3 w-2/3 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Desktop timeline */}
              <div className="hidden sm:block">
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-2">
                    {entries.map((entry) => (
                      <button key={`${entry.type}-${entry._id}`} onClick={() => setSelected(entry)} className="w-full text-left">
                        <InventoryEntry entry={entry} isSelected={selected?._id === entry._id && selected?.type === entry.type} />
                      </button>
                    ))}
                    {entries.length === 0 && (
                      <div className="ml-16 rounded-lg border border-dashed border-border p-8 text-center text-text-muted">
                        Aucun événement trouvé
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 sm:hidden">
                {entries.map((entry) => (
                  <button key={`${entry.type}-${entry._id}`} onClick={() => setSelected(entry)} className="w-full text-left">
                    <InventoryEntry entry={entry} compact isSelected={selected?._id === entry._id && selected?.type === entry.type} />
                  </button>
                ))}
                {entries.length === 0 && <p className="py-12 text-center text-text-muted">Aucun événement</p>}
              </div>

              {pagination.pages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
                  <span className="px-4 py-1 text-sm text-text-muted">Page {page} / {pagination.pages}</span>
                  <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <EntryDetail entry={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  )
}

function InventoryEntry({ entry, compact, isSelected }) {
  const isStock = entry.type === 'stock'
  const Icon = actionIcons[entry.action] || (isStock ? Package : Activity)
  const colorClass = actionColors[entry.action] || 'bg-gray-100 text-gray-700'
  const userName = entry.user ? `${entry.user.firstName || ''} ${entry.user.lastName || ''}`.trim() || entry.user.email : 'Système'
  const userRole = entry.user?.role || ''

  const date = new Date(entry.date)
  const dateStr = date.toLocaleDateString('fr-FR')
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  if (compact) {
    return (
      <div className={`rounded-lg border p-4 transition-colors ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-surface hover:border-primary/30'}`}>
        <div className="mb-2 flex items-center justify-between">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>{getActionLabel(entry)}</span>
          <span className="text-xs text-text-muted">{dateStr} {timeStr}</span>
        </div>
        <p className="text-sm text-text">{entry.description}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
          <span>{userName}</span>
          {userRole && <span className="rounded bg-muted px-1 py-0.5">{userRole === 'admin' ? 'Admin' : 'Manager'}</span>}
          {isStock && (
            <span className={`inline-flex items-center gap-0.5 font-medium ${entry.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <RotateCcw className="h-3 w-3" />
              {entry.delta > 0 ? '+' : ''}{entry.delta}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`ml-16 relative pb-2 ${isSelected ? 'scale-[1.02]' : ''}`}>
      <div className={`absolute -left-[2.65rem] top-3.5 h-3 w-3 rounded-full border-2 border-white ring-2 transition-all ${isSelected ? 'ring-primary scale-150' : isStock ? 'ring-orange-400 bg-orange-100' : 'ring-blue-400 bg-blue-100'}`} />
      <div className={`rounded-lg border p-4 transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20' : 'border-border bg-surface hover:border-primary/30 hover:shadow-sm'}`}>
        <div className="flex items-start gap-3">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>{getActionLabel(entry)}</span>
              {isStock && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${entry.delta > 0 ? 'bg-green-100 text-green-700' : entry.delta < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                  {entry.delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {entry.delta > 0 ? '+' : ''}{entry.delta}
                </span>
              )}
              <span className="text-xs text-text-muted">{dateStr} {timeStr}</span>
            </div>

            <p className="text-sm text-text">{entry.description}</p>

            {isStock && (
              <div className="mt-1.5 flex items-center gap-2 text-xs text-text-muted">
                <span>Stock: <strong className="text-text">{entry.previousStock}</strong></span>
                <span>→</span>
                <span className={`font-medium ${entry.delta > 0 ? 'text-green-600' : entry.delta < 0 ? 'text-red-600' : 'text-text'}`}>{entry.newStock}</span>
                {entry.product?.name && <span>· {entry.product.name}</span>}
              </div>
            )}

            {!isStock && entry.order && (
              <p className="mt-1 text-xs text-text-muted">
                Commande <strong>{entry.order.orderNumber}</strong>
                {entry.order.totalAmount && <span> · {entry.order.totalAmount.toLocaleString()} CFA</span>}
              </p>
            )}
            {!isStock && entry.product && (
              <p className="mt-1 text-xs text-text-muted">Produit: <strong>{entry.product.name}</strong></p>
            )}

            <div className="mt-2 flex items-center gap-2 text-xs text-text-muted border-t border-border pt-2">
              <UserCircle className="h-3.5 w-3.5" />
              <span>{userName}</span>
              {userRole && <span className="rounded bg-muted px-1.5 py-0.5 font-medium">{userRole === 'admin' ? 'Admin' : 'Manager'}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EntryDetail({ entry, onClose }) {
  const isStock = entry.type === 'stock'
  const Icon = actionIcons[entry.action] || (isStock ? Package : Activity)
  const colorClass = actionColors[entry.action] || 'bg-gray-100 text-gray-700'
  const userName = entry.user ? `${entry.user.firstName || ''} ${entry.user.lastName || ''}`.trim() || entry.user.email : 'Système'
  const userEmail = entry.user?.email || ''
  const userRole = entry.user?.role || ''
  const roleLabel = userRole === 'admin' ? 'Admin' : userRole === 'manager' ? 'Manager' : ''

  const date = new Date(entry.date)
  const dateFull = date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const timeFull = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="w-full lg:w-96 shrink-0">
      <div className="sticky top-4 rounded-xl border border-border bg-surface shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="font-semibold text-text">{getActionLabel(entry)}</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-text-muted hover:bg-muted hover:text-text transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {/* Description */}
          <div>
            <p className="flex items-start gap-2 text-sm text-text">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
              {entry.description}
            </p>
          </div>

          {/* Timestamps */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Date</h4>
            <div className="flex items-center gap-2 text-sm text-text">
              <Clock className="h-4 w-4 text-text-muted" />
              <span>{dateFull}</span>
            </div>
            <p className="ml-6 text-xs text-text-muted">{timeFull}</p>
          </div>

          {/* Stock details */}
          {isStock && (
            <>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Mouvement de stock</h4>
                <div className="rounded-lg bg-muted p-3">
                  <div className="mb-3 flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-text-muted">Avant</p>
                      <p className="text-2xl font-bold text-text">{entry.previousStock}</p>
                    </div>
                    <div className="flex items-center">
                      {entry.delta > 0 ? (
                        <TrendingUp className="h-6 w-6 text-green-500" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-text-muted">Après</p>
                      <p className="text-2xl font-bold text-text">{entry.newStock}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${entry.delta > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {entry.delta > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      Variation: {entry.delta > 0 ? '+' : ''}{entry.delta}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product card */}
              {entry.product && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Produit</h4>
                  <Link to={`/admin/products`} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted transition-colors group">
                    {entry.product.images?.[0] ? (
                      <img src={entry.product.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <Package className="h-5 w-5 text-text-muted" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text truncate">{entry.product.name}</p>
                      <div className="flex flex-wrap gap-x-3 text-xs text-text-muted">
                        {entry.product.sku && <span>SKU: {entry.product.sku}</span>}
                        {entry.product.basePrice && <span>{entry.product.basePrice.toLocaleString()} CFA</span>}
                        <span>Stock: {entry.product.stock}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Activity details */}
          {!isStock && (
            <>
              {/* Order info */}
              {entry.order && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Commande</h4>
                  <Link to={`/admin/orders`} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted transition-colors group">
                    <div>
                      <p className="font-medium text-text">{entry.order.orderNumber}</p>
                      {entry.order.totalAmount && (
                        <p className="text-sm text-text-muted">{entry.order.totalAmount.toLocaleString()} CFA</p>
                      )}
                      {entry.order.status && (
                        <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {entry.order.status}
                        </span>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
              )}

              {/* Product info */}
              {entry.product && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Produit</h4>
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    {entry.product.images?.[0] ? (
                      <img src={entry.product.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <Package className="h-5 w-5 text-text-muted" />
                    )}
                    <div>
                      <p className="font-medium text-text">{entry.product.name}</p>
                      {entry.product.sku && <p className="text-xs text-text-muted">{entry.product.sku}</p>}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Reference */}
          {entry.referenceType && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Référence</h4>
              <div className="flex items-center gap-2 text-sm text-text">
                <Hash className="h-4 w-4 text-text-muted" />
                <span>{entry.referenceType}</span>
                {entry.referenceId && (
                  <span className="font-mono text-xs text-text-muted">#{String(entry.referenceId).slice(-12).toUpperCase()}</span>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Métadonnées</h4>
              <div className="rounded-lg bg-muted p-3">
                {Object.entries(entry.metadata).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1 text-sm">
                    <span className="text-text-muted">{k}</span>
                    <span className="font-medium text-text">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User info */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Utilisateur</h4>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {entry.user ? (entry.user.firstName?.[0] || entry.user.email?.[0] || '?').toUpperCase() : 'S'}
              </div>
              <div>
                <p className="font-medium text-text">{userName}</p>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  {userEmail && <span>{userEmail}</span>}
                  {roleLabel && (
                    <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-text">{roleLabel}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ID technique */}
          <div className="border-t border-border pt-3">
            <p className="text-xs text-text-muted/60 font-mono">ID: {entry._id}</p>
            <p className="text-xs text-text-muted/60 font-mono">Type: {entry.type}</p>
            <p className="text-xs text-text-muted/60 font-mono">Action: {entry.action} / {entry.reason || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
