import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false)
  const discount = product.comparePrice > product.basePrice
    ? Math.round((1 - product.basePrice / product.comparePrice) * 100)
    : 0

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link
        to={`/products/${product.slug}`}
        className="group relative flex flex-col rounded-xl border border-border bg-surface overflow-hidden transition-shadow hover:shadow-lg"
      >
        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="rounded-full bg-danger px-2.5 py-0.5 text-xs font-bold text-white shadow-md">
              -{discount}%
            </span>
          )}
        </div>

        {/* Image */}
        <div className="aspect-square overflow-hidden bg-muted">
          {product.images?.[0] && !imgError ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted">
              Pas d'image
            </div>
          )}
          {/* Hover overlay */}
          {product.stock > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
              <span className="translate-y-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <ShoppingCart className="mr-1.5 inline h-4 w-4" />
                Voir le produit
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">
            {product.category?.name}
          </p>
          <h3 className="mb-2 font-semibold text-text line-clamp-2">
            {product.name}
          </h3>
          <div className="mt-auto flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {product.basePrice.toLocaleString()} CFA
            </span>
            {discount > 0 && (
              <span className="text-sm text-text-muted line-through">
                {product.comparePrice.toLocaleString()} CFA
              </span>
            )}
          </div>
          {product.stock === 0 && (
            <p className="mt-1.5 text-xs font-medium text-danger">Rupture de stock</p>
          )}
          {product.stock > 0 && product.stock <= 3 && (
            <p className="mt-1.5 text-xs font-medium text-accent">Plus que {product.stock} en stock</p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-surface">
      <div className="aspect-square rounded-t-xl bg-muted" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-5 w-1/2 rounded bg-muted" />
      </div>
    </div>
  )
}
