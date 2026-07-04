import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProduct } from '@/hooks/useProducts'
import Button from '@/components/ui/button'
import useCartStore from '@/store/cartStore'
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
