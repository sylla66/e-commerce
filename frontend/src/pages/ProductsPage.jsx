import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard'
import Button from '@/components/ui/button'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [showFilters, setShowFilters] = useState(false)

  const params = {
    page: searchParams.get('page') || 1,
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-createdAt',
  }

  const { data, isLoading } = useProducts(params)
  const { data: categories } = useCategories()
  const products = data?.products || []
  const pagination = data?.pagination || {}

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    if (key !== 'page') next.set('page', 1)
    setSearchParams(next)
  }

  const clearFilters = () => setSearchParams({})

  const handleSearch = (e) => {
    e.preventDefault()
    updateParam('search', searchInput)
  }

  const activeFilters = [...searchParams.entries()].filter(([k]) => k !== 'page').length

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-text">Nos Produits</h1>

        <form onSubmit={handleSearch} className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
        </form>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filtres{activeFilters > 0 && ` (${activeFilters})`}
        </Button>
      </div>

      {showFilters && (
        <div className="mb-6 rounded-lg border border-border bg-surface p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs text-text-muted">Catégorie</label>
              <select
                value={params.category}
                onChange={(e) => updateParam('category', e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text"
              >
                <option value="">Toutes</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-text-muted">Prix min</label>
              <input
                type="number"
                placeholder="0"
                value={params.minPrice}
                onChange={(e) => updateParam('minPrice', e.target.value)}
                className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-text-muted">Prix max</label>
              <input
                type="number"
                placeholder="100000"
                value={params.maxPrice}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-text-muted">Trier par</label>
              <select
                value={params.sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text"
              >
                <option value="-createdAt">Nouveautés</option>
                <option value="basePrice">Prix croissant</option>
                <option value="-basePrice">Prix décroissant</option>
                <option value="name">Nom A-Z</option>
              </select>
            </div>

            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>

      {!isLoading && products.length === 0 && (
        <div className="py-12 text-center text-text-muted">
          Aucun produit trouvé
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => updateParam('page', String(pagination.page - 1))}
          >
            Précédent
          </Button>
          <span className="px-4 text-sm text-text-muted">
            Page {pagination.page} / {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => updateParam('page', String(pagination.page + 1))}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  )
}
