import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customFieldService } from '@/services/customFieldService'
import { useCategories } from '@/hooks/useCategories'
import Button from '@/components/ui/button'

const fieldTypes = [
  { value: 'text', label: 'Texte' },
  { value: 'number', label: 'Montant fixe (CFA)' },
  { value: 'percentage', label: 'Pourcentage (%)' },
  { value: 'boolean', label: 'Oui/Non' },
  { value: 'select', label: 'Sélection' },
]

export default function AdminCustomFields() {
  const qc = useQueryClient()
  const { data: fields } = useQuery({
    queryKey: ['custom-fields'],
    queryFn: () => customFieldService.list(true),
  })
  const { data: categories } = useCategories(true)

  const createMutation = useMutation({
    mutationFn: (data) => customFieldService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-fields'] }),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => customFieldService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-fields'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => customFieldService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-fields'] }),
  })

  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', label: '', type: 'number', options: '', defaultValue: '',
    isRequired: false, appliesTo: 'all', categories: [], sortOrder: 0,
  })

  const resetForm = () => {
    setForm({ name: '', label: '', type: 'number', options: '', defaultValue: '',
      isRequired: false, appliesTo: 'all', categories: [], sortOrder: 0 })
    setEditing(null)
    setShowForm(false)
  }

  const startEdit = (f) => {
    setEditing(f._id)
    setForm({
      name: f.name, label: f.label, type: f.type,
      options: (f.options || []).join(', '),
      defaultValue: f.defaultValue ?? '',
      isRequired: f.isRequired || false,
      appliesTo: f.appliesTo || 'all',
      categories: (f.categories || []).map((c) => c._id || c),
      sortOrder: f.sortOrder || 0,
    })
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      ...form,
      options: form.type === 'select' ? form.options.split(',').map((s) => s.trim()).filter(Boolean) : [],
      defaultValue: form.defaultValue || undefined,
    }
    if (editing) {
      updateMutation.mutate({ id: editing, data }, { onSuccess: resetForm })
    } else {
      createMutation.mutate(data, { onSuccess: resetForm })
    }
  }

  const typeLabel = (t) => fieldTypes.find((ft) => ft.value === t)?.label || t

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Champs personnalisés</h1>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus className="mr-2 h-4 w-4" />Nouveau champ
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 font-semibold text-text">
            {editing ? 'Modifier le champ' : 'Nouveau champ personnalisé'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">Nom technique</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">Étiquette (affichage)</label>
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text">
                {fieldTypes.map((ft) => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">Ordre d'affichage</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text" />
            </div>
            {form.type === 'select' && (
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-text-muted">
                  Options (séparées par des virgules)
                </label>
                <input value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text"
                  placeholder="Option 1, Option 2, Option 3" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">Valeur par défaut</label>
              <input value={form.defaultValue} onChange={(e) => setForm({ ...form, defaultValue: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">Appliquer à</label>
              <select value={form.appliesTo} onChange={(e) => setForm({ ...form, appliesTo: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text">
                <option value="all">Toutes les commandes</option>
                <option value="category">Catégories spécifiques</option>
              </select>
            </div>
            {form.appliesTo === 'category' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-text-muted">Catégories</label>
                <select multiple value={form.categories} onChange={(e) =>
                  setForm({ ...form, categories: [...e.target.selectedOptions].map((o) => o.value) })
                } className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text min-h-[100px]">
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-text">
                <input type="checkbox" checked={form.isRequired}
                  onChange={(e) => setForm({ ...form, isRequired: e.target.checked })}
                  className="rounded border-border" />
                Champ obligatoire
              </label>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button type="submit">{editing ? 'Mettre à jour' : 'Créer'}</Button>
            <Button variant="outline" type="button" onClick={resetForm}>Annuler</Button>
          </div>
        </form>
      )}

      {!fields || fields.length === 0 ? (
        <p className="py-12 text-center text-text-muted">
          Aucun champ personnalisé défini. Les champs permettent d'ajouter des taxes, frais ou suppléments aux commandes.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-text-muted">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Étiquette</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Applicable à</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fields.map((f) => (
                <tr key={f._id} className="bg-surface">
                  <td className="px-4 py-3 font-medium text-text">{f.name}</td>
                  <td className="px-4 py-3 text-text">{f.label}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      {typeLabel(f.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {f.appliesTo === 'category'
                      ? `Catégories (${(f.categories || []).length})`
                      : 'Toutes les commandes'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(f)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(f._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
