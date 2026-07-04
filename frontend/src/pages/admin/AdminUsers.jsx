import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Search, Shield, ShieldOff, Trash2, UserPlus } from 'lucide-react'
import api from '@/services/api'
import Button from '@/components/ui/button'

const ROLE_LABELS = { admin: 'Admin', manager: 'Gestionnaire', customer: 'Client' }
const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  customer: 'bg-gray-100 text-gray-800',
}
const ROLE_CYCLE = ['customer', 'manager', 'admin']

function nextRole(current) {
  const idx = ROLE_CYCLE.indexOf(current)
  return ROLE_CYCLE[(idx + 1) % ROLE_CYCLE.length]
}

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'customer' })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () => api.get('/admin/users', { params: { page, limit: 20, search: search || undefined, role: roleFilter || undefined } }).then(r => r.data),
  })
  const users = data?.users || []
  const pagination = data?.pagination || {}

  const toggleRole = useMutation({
    mutationFn: ({ id, role }) => api.patch(`/admin/users/${id}`, { role: nextRole(role) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }) => api.patch(`/admin/users/${id}`, { isActive: !isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const deleteUser = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const createUser = useMutation({
    mutationFn: (data) => api.post('/auth/admin/create', data),
    onSuccess: () => {
      setShowCreate(false)
      setCreateForm({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'customer' })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const handleCreate = (e) => {
    e.preventDefault()
    createUser.mutate(createForm)
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text">Utilisateurs</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Rechercher..." className="w-48 rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text">
            <option value="">Tous les rôles</option>
            <option value="customer">Client</option>
            <option value="manager">Gestionnaire</option>
            <option value="admin">Admin</option>
          </select>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <UserPlus className="mr-1 h-4 w-4" /> Créer
          </Button>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-bold text-text">Créer un utilisateur</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Prénom</label>
                  <input name="firstName" value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Nom</label>
                  <input name="lastName" value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text" required />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Email</label>
                <input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text" required />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Mot de passe</label>
                <input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text" minLength={8} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Téléphone</label>
                  <input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Rôle</label>
                  <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text">
                    <option value="customer">Client</option>
                    <option value="manager">Gestionnaire</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              {createUser.isError && <p className="text-xs text-danger">{createUser.error?.response?.data?.message || 'Erreur'}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Annuler</Button>
                <Button type="submit" disabled={createUser.isPending}>{createUser.isPending ? 'Création...' : 'Créer'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="hidden sm:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-text-muted">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Inscrit le</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u._id} className="bg-surface">
                <td className="px-4 py-3 font-medium text-text">{u.firstName} {u.lastName}</td>
                <td className="px-4 py-3 text-text-muted">{u.email}</td>
                <td className="px-4 py-3 text-text-muted">{u.phone || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[u.role] || ROLE_COLORS.customer}`}>{ROLE_LABELS[u.role] || u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{u.isActive ? 'Actif' : 'Inactif'}</span>
                </td>
                <td className="px-4 py-3 text-text-muted">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => toggleRole.mutate({ id: u._id, role: u.role })} title={`Passer ${nextRole(u.role)}`}>
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleActive.mutate({ id: u._id, isActive: u.isActive })} title={u.isActive ? 'Désactiver' : 'Activer'}>
                      {u.isActive ? <span className="text-red-500">✕</span> : <span className="text-green-500">✓</span>}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { if (window.confirm('Supprimer cet utilisateur ?')) deleteUser.mutate(u._id) }} title="Supprimer">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="7" className="px-4 py-12 text-center text-text-muted">Aucun utilisateur</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 sm:hidden">
        {users.map((u) => (
          <div key={u._id} className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-text">{u.firstName} {u.lastName}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{u.isActive ? 'Actif' : 'Inactif'}</span>
            </div>
            <p className="text-sm text-text-muted">{u.email}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[u.role] || ROLE_COLORS.customer}`}>{ROLE_LABELS[u.role] || u.role}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => toggleRole.mutate({ id: u._id, role: u.role })}><Shield className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => { if (window.confirm('Supprimer ?')) deleteUser.mutate(u._id) }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="py-12 text-center text-text-muted">Aucun utilisateur</p>}
      </div>

      {pagination.pages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
          <span className="px-4 py-1 text-sm text-text-muted">Page {page} / {pagination.pages}</span>
          <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Suivant</Button>
        </div>
      )}
    </div>
  )
}
