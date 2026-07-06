import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, ChevronLeft, ChevronRight, Star, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProduct } from '@/hooks/useProducts'
import Button from '@/components/ui/button'
import useCartStore from '@/store/cartStore'
import useAuthStore from '@/hooks/useAuth'
import api from '@/services/api'
import { useToast } from '@/components/ui/toaster'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { data: product, isLoading } = useProduct(slug)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((s) => s.addItem)
  const { toast } = useToast()

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6 h-6 w-32 rounded bg-muted" />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square rounded-lg bg-muted" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-muted" />
            <div className="h-6 w-1/4 rounded bg-muted" />
            <div className="h-24 rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="py-12 text-center text-text-muted">
        Produit introuvable
      </div>
    )
  }

  const handleAddToCart = () => {
    addItem(product, quantity)
    toast({
      title: 'Ajouté au panier',
      description: `${product.name} (x${quantity})`,
    })
  }

  const images = product.images?.length ? product.images : []
  const hasMultipleImages = images.length > 1

  const nextImage = () => setSelectedImage((s) => (s + 1) % images.length)
  const prevImage = () => setSelectedImage((s) => (s - 1 + images.length) % images.length)

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link to="/" className="hover:text-text">Accueil</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-text">Produits</Link>
        {product.category?.slug && (
          <>
            <span>/</span>
            <Link to={`/products?category=${product.category.slug}`} className="hover:text-text">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image gallery */}
        <div>
          <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-muted">
            {images.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={product.name}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.2 }}
                  className="h-full w-full object-cover"
                />
              </AnimatePresence>
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted text-sm">Pas d'image</div>
            )}
            {hasMultipleImages && (
              <>
                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-700 shadow-lg backdrop-blur-sm hover:bg-white transition-all">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-700 shadow-lg backdrop-blur-sm hover:bg-white transition-all">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            {product.stock === 0 && (
              <div className="absolute left-4 top-4 rounded-full bg-danger px-3 py-1 text-xs font-bold text-white">
                Rupture de stock
              </div>
            )}
          </div>
          {images.length > 0 && hasMultipleImages && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    i === selectedImage ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="mb-1 text-sm font-medium uppercase tracking-wide text-text-muted">
            {product.category?.name}
          </p>
          <h1 className="mb-4 text-3xl font-bold text-text">{product.name}</h1>

          <div className="mb-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {product.basePrice.toLocaleString()} CFA
            </span>
            {product.comparePrice > product.basePrice && (
              <span className="text-lg text-text-muted line-through">
                {product.comparePrice.toLocaleString()} CFA
              </span>
            )}
          </div>

          <p className="mb-6 leading-relaxed text-text">{product.description}</p>

          {/* Desktop add to cart */}
          <div className="hidden sm:block">
            {product.stock > 0 ? (
              <div className="mb-6 flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-border">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-text-muted hover:text-text transition-colors" disabled={quantity <= 1}>-</button>
                  <span className="min-w-[3rem] text-center text-text font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2 text-text-muted hover:text-text transition-colors" disabled={quantity >= product.stock}>+</button>
                </div>
                <Button onClick={handleAddToCart} size="lg" className="shadow-lg shadow-primary/20">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Ajouter au panier
                </Button>
              </div>
            ) : (
              <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-danger">Rupture de stock</p>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <p className="mb-4 text-sm font-medium text-accent animate-pulse">Plus que {product.stock} en stock !</p>
            )}
          </div>

          {/* Mobile stock info */}
          <div className="sm:hidden">
            {product.stock === 0 && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-danger">Rupture de stock</p>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <p className="mb-4 text-sm font-medium text-accent">Plus que {product.stock} en stock !</p>
            )}
          </div>

          {/* Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border p-5"
            >
              <h3 className="mb-4 font-semibold text-text">Caractéristiques</h3>
              <dl className="space-y-3">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-border pb-2 text-sm last:border-0 last:pb-0">
                    <dt className="text-text-muted">{key}</dt>
                    <dd className="font-medium text-text">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <ReviewsSection productId={product._id} productSlug={slug} />

      {/* Sticky mobile add-to-cart */}
      {product.stock > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface/95 backdrop-blur-md p-3 sm:hidden">
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-border">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-text-muted hover:text-text" disabled={quantity <= 1}>-</button>
              <span className="min-w-[2.5rem] text-center text-text font-medium">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2 text-text-muted hover:text-text" disabled={quantity >= product.stock}>+</button>
            </div>
            <Button onClick={handleAddToCart} className="flex-1 shadow-lg shadow-primary/20">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Ajouter · {product.basePrice.toLocaleString()} CFA
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewsSection({ productId, productSlug }) {
  const { user, isAuthenticated } = useAuthStore()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productSlug],
    queryFn: () => api.get(`/reviews/product/${productSlug}`).then((r) => r.data),
    enabled: !!productSlug,
  })

  const createReview = useMutation({
    mutationFn: (data) => api.post('/reviews', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reviews', productSlug] }); setShowForm(false); setForm({ rating: 5, title: '', comment: '' }) },
  })

  const deleteReview = useMutation({
    mutationFn: (id) => api.delete(`/reviews/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', productSlug] }),
  })

  const reviews = data?.reviews || []
  const average = data?.average || 0
  const total = data?.total || 0

  return (
    <div className="mt-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text">Avis clients</h2>
          {total > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-4 w-4 ${s <= Math.round(average) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                ))}
              </div>
              <span className="text-sm text-text-muted">{average.toFixed(1)} — {total} avis</span>
            </div>
          )}
        </div>
        {isAuthenticated && (
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : 'Donner mon avis'}
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createReview.mutate({ ...form, productId }) }}
          className="mb-8 rounded-lg border border-border bg-surface p-5">
          <h3 className="mb-4 font-semibold text-text">Votre avis</h3>
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })}
                className="transition-colors">
                <Star className={`h-6 w-6 ${s <= form.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
              </button>
            ))}
          </div>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Titre de votre avis (optionnel)"
            className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text" />
          <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
            placeholder="Partagez votre expérience..." rows={3}
            className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text" />
          <Button type="submit" disabled={createReview.isPending}>
            {createReview.isPending ? 'Envoi...' : 'Publier'}
          </Button>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border border-border bg-surface p-5">
              <div className="mb-2 h-4 w-32 rounded bg-muted" />
              <div className="mb-3 h-3 w-48 rounded bg-muted" />
              <div className="h-12 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="divide-y divide-border rounded-lg border border-border">
          {reviews.map((review) => (
            <div key={review._id} className="bg-surface p-5">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {review.user?.firstName?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-text">{review.user?.firstName} {review.user?.lastName}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">{new Date(review.createdAt).toLocaleDateString('fr-FR')}</span>
                  {(user?._id === review.user?._id || user?.role === 'admin' || user?.role === 'manager') && (
                    <button onClick={() => deleteReview.mutate(review._id)}
                      className="text-text-muted hover:text-danger transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {review.title && <p className="mb-1 font-medium text-text">{review.title}</p>}
              {review.comment && <p className="text-sm text-text-muted">{review.comment}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <Star className="mx-auto mb-3 h-10 w-10 text-muted" />
          <p className="font-medium text-text">Aucun avis pour le moment</p>
          <p className="text-sm text-text-muted">Soyez le premier à donner votre avis</p>
        </div>
      )}
    </div>
  )
}
