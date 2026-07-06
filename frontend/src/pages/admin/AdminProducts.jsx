import { useState } from 'react'
import { Plus, Trash2, AlertTriangle, Package, Save, X } from 'lucide-react'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import Button from '@/components/ui/button'

export default function AdminProducts() {
  const [page, setPage] = useState(1)
  const { data } = useProducts({ page, limit: 20 })
  const deleteProduct = useDeleteProduct()
  const updateProduct = useUpdateProduct()
  const products = data?.products || []
  const pagination = data?.pagination || {}
  const [editStock, setEditStock] = useState(null)
  const [stockValue, setStockValue] = useState('')

  const handleSaveStock = async (productId) => {
    await updateProduct.mutateAsync({ id: productId, data: { stock: parseInt(stockValue) || 0 } })
    setEditStock(null)
  }

  const stockBadge = (stock) => {
    if (stock === 0) return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">Rupture</span>
    if (stock <= 5) return <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">Stock faible</span>
    return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">{stock}</span>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Produits</h1>
        <LinkToCreate />
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-text-muted">
            <tr>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p._id} className={`bg-surface ${p.stock <= 5 ? 'bg-red-50/30' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.stock === 0 && <AlertTriangle className="h-4 w-4 flex-shrink-0 text-danger" />}
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-muted"><Package className="h-5 w-5 text-text-muted" /></div>
                    )}
                    <div>
                      <span className="font-medium text-text">{p.name}</span>
                      {p.stock <= 5 && <p className="text-xs text-danger">{p.stock === 0 ? 'Épuisé' : 'Réapprovisionner'}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text">{p.basePrice.toLocaleString()} CFA</td>
                <td className="px-4 py-3">
                  {editStock === p._id ? (
                    <div className="flex items-center gap-1">
                      <input type="number" value={stockValue} onChange={(e) => setStockValue(e.target.value)}
                        className="w-20 rounded border border-border px-2 py-1 text-sm text-text"
                        autoFocus min="0" />
                      <Button variant="ghost" size="icon" onClick={() => handleSaveStock(p._id)}>
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditStock(null)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditStock(p._id); setStockValue(String(p.stock)) }}
                      className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                      {stockBadge(p.stock)}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-text-muted">{p.category?.name}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => deleteProduct.mutate(p._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {products.map((p) => (
          <div key={p._id} className={`rounded-lg border border-border p-4 ${p.stock === 0 ? 'border-red-200 bg-red-50/30' : p.stock <= 5 ? 'border-orange-200 bg-orange-50/30' : 'bg-surface'}`}>
            <div className="flex items-center gap-3">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt="" className="h-12 w-12 rounded object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-muted"><Package className="h-6 w-6 text-text-muted" /></div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text truncate">{p.name}</p>
                <p className="text-xs text-text-muted">{p.category?.name}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-semibold text-primary">{p.basePrice.toLocaleString()} CFA</span>
                {stockBadge(p.stock)}
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteProduct.mutate(p._id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Précédent
          </Button>
          <span className="px-4 py-1 text-sm text-text-muted">Page {page} / {pagination.pages}</span>
          <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
            Suivant
          </Button>
        </div>
      )}
    </div>
  )
}

function LinkToCreate() {
  const [show, setShow] = useState(false)
  const categories = useCategories(true)
  const createProduct = useCreateProduct()

  const [form, setForm] = useState({
    name: '', slug: '', description: '', shortDescription: '',
    basePrice: '', comparePrice: '', stock: '', sku: '',
    category: '', isFeatured: false,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    createProduct.mutate(fd, { onSuccess: () => { setShow(false); resetForm() } })
  }

  const resetForm = () => setForm({
    name: '', slug: '', description: '', shortDescription: '',
    basePrice: '', comparePrice: '', stock: '', sku: '',
    category: '', isFeatured: false,
  })

  if (!show) {
    return <Button size="sm" onClick={() => setShow(true)}><Plus className="mr-2 h-4 w-4" />Nouveau produit</Button>
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-lg bg-surface p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-text">Nouveau produit</h2>
        <div className="space-y-3">
          <input placeholder="Nom" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm" required />
          <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm" required />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm" rows={3} required />
          <input placeholder="Description courte" value={form.shortDescription} onChange={(e) => setForm({...form, shortDescription: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Prix" value={form.basePrice} onChange={(e) => setForm({...form, basePrice: e.target.value})} className="rounded-lg border border-border px-3 py-2 text-sm" required />
            <input type="number" placeholder="Prix barre" value={form.comparePrice} onChange={(e) => setForm({...form, comparePrice: e.target.value})} className="rounded-lg border border-border px-3 py-2 text-sm" />
            <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} className="rounded-lg border border-border px-3 py-2 text-sm" />
            <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})} className="rounded-lg border border-border px-3 py-2 text-sm" />
          </div>
          <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm" required>
            <option value="">Catégorie</option>
            {categories.data?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => setShow(false)}>Annuler</Button>
          <Button type="submit">Créer</Button>
        </div>
      </form>
    </div>
  )
}
