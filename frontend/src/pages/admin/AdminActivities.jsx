import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Activity, RefreshCw } from 'lucide-react'
import api from '@/services/api'
import Button from '@/components/ui/button'

const actionLabels = {
  update_status: 'Changement de statut',
  contact_customer: 'Contact client',
  note_added: 'Note ajoutée',
  tracking_added: 'Numéro de suivi ajouté',
}

export default function AdminActivities() {
  const [page, setPage] = useState(1)
  const [managerFilter, setManagerFilter] = useState('')
  const { data, isLoading } = useQuery({
    queryKey: ['admin-activities', page, managerFilter],
    queryFn: () => api.get('/admin/activities', { params: { page, limit: 20, managerId: managerFilter || undefined } }).then((r) => r.data),
  })
  const activities = data?.activities || []
  const pagination = data?.pagination || {}

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Activités des gestionnaires</h1>
      </div>

      <div className="hidden sm:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-text-muted">
            <tr>
              <th className="px-4 py-3">Gestionnaire</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Commande</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activities.map((a) => (
              <tr key={a._id} className="bg-surface">
                <td className="px-4 py-3 font-medium text-text">{a.manager?.firstName} {a.manager?.lastName}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">{actionLabels[a.action] || a.action}</span>
                </td>
                <td className="px-4 py-3 text-text-muted">{a.order?.orderNumber || '—'}</td>
                <td className="px-4 py-3 text-text">{a.description || '—'}</td>
                <td className="px-4 py-3 text-text-muted whitespace-nowrap">{new Date(a.createdAt).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr><td colSpan="5" className="px-4 py-12 text-center text-text-muted">Aucune activité</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 sm:hidden">
        {activities.map((a) => (
          <div key={a._id} className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-medium text-text">{a.manager?.firstName} {a.manager?.lastName}</span>
              <span className="text-xs text-text-muted">{new Date(a.createdAt).toLocaleString('fr-FR')}</span>
            </div>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">{actionLabels[a.action] || a.action}</span>
            <p className="mt-2 text-sm text-text-muted">{a.description || '—'}</p>
            <p className="text-xs text-text-muted">Commande: {a.order?.orderNumber || '—'}</p>
          </div>
        ))}
        {activities.length === 0 && <p className="py-12 text-center text-text-muted">Aucune activité</p>}
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
