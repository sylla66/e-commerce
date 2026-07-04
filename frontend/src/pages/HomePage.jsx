import { useProducts } from '@/hooks/useProducts'
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard'

export default function HomePage() {
  const { data, isLoading } = useProducts({ featured: 'true', limit: 4 })
  const products = data?.products || []

  return (
    <div>
      <section className="mb-12 text-center py-8">
        <h2 className="mb-4 text-4xl font-bold text-text">
          Bienvenue sur Ma Boutique
        </h2>
        <p className="text-lg text-text-muted">
          Découvrez notre sélection de produits
        </p>
      </section>

      <section>
        <h3 className="mb-6 text-2xl font-semibold text-text">
          Produits en vedette
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => <ProductCard key={product._id} product={product} />)
          }
        </div>
      </section>
    </div>
  )
}
