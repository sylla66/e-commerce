import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories'
import Button from '@/components/ui/button'

export default function AdminCategories() {
  const { data: categories, isLoading } = useCategories(true)
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '' })

  const resetForm = () => {
    setForm({ name: '', slug: '', description: '' })
    setEditing(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editing) {
      updateCategory.mutate({ id: editing, data: form }, { onSuccess: resetForm })
    } else {
      createCategory.mutate(form, { onSuccess: resetForm })
    }
  }

  const startEdit = (cat) => {
    setEditing(cat._id)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '' })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Catégories</h1>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 flex flex-wrap gap-3 rounded-lg border border-border bg-surface p-4">
        <input
          placeholder="Nom"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text"
          required
        />
        <input
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text"
          required
        />
        <input
          placeholder="Description (optionnelle)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text"
        />
        <Button type="submit" size="sm">
          {editing ? 'Mettre à jour' : 'Ajouter'}
        </Button>
        {editing && (
          <Button variant="ghost" size="sm" onClick={resetForm}>
            Annuler
          </Button>
        )}
      </form>

      <div className="space-y-2">
        {categories?.map((cat) => (
          <div key={cat._id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
            <div>
              <p className="font-medium text-text">{cat.name}</p>
              <p className="text-xs text-text-muted">/{cat.slug}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => startEdit(cat)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => deleteCategory.mutate(cat._id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
