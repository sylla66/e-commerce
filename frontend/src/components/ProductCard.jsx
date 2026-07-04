import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group rounded-lg border border-border bg-surface transition-shadow hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
        {product.images?.[0] && !imgError ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-muted">
            Pas d'image
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="mb-1 text-xs text-text-muted">
          {product.category?.name}
        </p>
        <h3 className="mb-2 font-medium text-text line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">
            {product.basePrice.toLocaleString()} CFA
          </span>
          {product.comparePrice > product.basePrice && (
            <span className="text-sm text-text-muted line-through">
              {product.comparePrice.toLocaleString()} CFA
            </span>
          )}
        </div>
        {product.stock === 0 && (
          <p className="mt-1 text-xs text-danger">Rupture de stock</p>
        )}
      </div>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-surface">
      <div className="aspect-square rounded-t-lg bg-muted" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-5 w-1/2 rounded bg-muted" />
      </div>
    </div>
  )
}
