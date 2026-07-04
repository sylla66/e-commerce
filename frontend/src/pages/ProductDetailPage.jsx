import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, ChevronLeft } from 'lucide-react'
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

  return (
    <div>
      <Link
        to="/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour aux produits
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-muted">
            {product.images?.[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">
                Pas d'image
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                    i === selectedImage ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-1 text-sm text-text-muted">
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

          {product.stock > 0 && (
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center rounded-lg border border-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-text-muted hover:text-text"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="min-w-[3rem] text-center text-text">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-text-muted hover:text-text"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <Button onClick={handleAddToCart} size="lg">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ajouter au panier
              </Button>
            </div>
          )}

          {product.stock === 0 && (
            <p className="mb-6 text-danger">Rupture de stock</p>
          )}

          {product.stock > 0 && product.stock <= 5 && (
            <p className="mb-4 text-sm text-accent">
              Plus que {product.stock} en stock
            </p>
          )}

          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-3 font-semibold text-text">Caractéristiques</h3>
              <dl className="space-y-2">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <dt className="text-text-muted">{key}</dt>
                    <dd className="text-text">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
