import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import Button from '@/components/ui/button'

export default function AdminProducts() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useProducts({ page, limit: 20 })
  const deleteProduct = useDeleteProduct()
  const products = data?.products || []
  const pagination = data?.pagination || {}

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Produits</h1>
        <LinkToCreate />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
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
              <tr key={p._id} className="bg-surface">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                    )}
                    <span className="font-medium text-text">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text">{p.basePrice.toLocaleString()} CFA</td>
                <td className="px-4 py-3">
                  <span className={`${p.stock === 0 ? 'text-danger' : 'text-text'}`}>
                    {p.stock}
                  </span>
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
