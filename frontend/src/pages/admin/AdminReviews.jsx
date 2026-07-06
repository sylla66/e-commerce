import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Star, Trash2, MessageSquare } from 'lucide-react'
import api from '@/services/api'
import Button from '@/components/ui/button'

export default function AdminReviews() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', page],
    queryFn: () => api.get('/reviews/admin', { params: { page, limit: 20 } }).then((r) => r.data),
  })

  const deleteReview = useMutation({
    mutationFn: (id) => api.delete(`/reviews/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  })

  const reviews = data?.reviews || []
  const pagination = data?.pagination || {}

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Avis clients</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border border-border bg-surface p-5">
              <div className="mb-2 h-4 w-48 rounded bg-muted" />
              <div className="h-8 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="divide-y divide-border rounded-lg border border-border">
          {reviews.map((review) => (
            <div key={review._id} className="bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {review.user?.firstName?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-text">{review.user?.firstName} {review.user?.lastName}</p>
                      <p className="text-xs text-text-muted">{review.user?.email}</p>
                    </div>
                    <div className="flex ml-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                      ))}
                    </div>
                  </div>
                  {review.title && <p className="font-medium text-text">{review.title}</p>}
                  {review.comment && <p className="mt-1 text-sm text-text-muted">{review.comment}</p>}
                  <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
                    <span>{new Date(review.createdAt).toLocaleDateString('fr-FR')}</span>
                    {review.product && (
                      <Link to={`/products/${review.product.slug}`} className="text-primary hover:underline">
                        {review.product.name}
                      </Link>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteReview.mutate(review._id)}
                  className="flex-shrink-0 text-text-muted hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted" />
          <p className="font-medium text-text">Aucun avis</p>
          <p className="text-sm text-text-muted">Les avis laissés par les clients apparaîtront ici</p>
        </div>
      )}

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
