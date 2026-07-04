import { useNavigate } from 'react-router-dom'
import { ArrowRight, Shield, Truck, RotateCcw, Headphones } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProducts } from '@/hooks/useProducts'
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard'
import Button from '@/components/ui/button'

const stagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1 } },
}
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const trusts = [
  { icon: Shield, title: 'Paiement sécurisé', desc: 'Transactions chiffrées' },
  { icon: Truck, title: 'Livraison rapide', desc: 'Sous 24-72h' },
  { icon: RotateCcw, title: 'Retour gratuit', desc: 'Satisfait ou remboursé' },
  { icon: Headphones, title: 'Support 24/7', desc: 'Une équipe à votre écoute' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { data, isLoading } = useProducts({ featured: 'true', limit: 4 })
  const products = data?.products || []

  return (
    <div>
      {/* Hero */}
      <section className="relative -mx-4 mb-16 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-4 py-20 text-white sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.3),transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-blue-200 backdrop-blur-sm"
          >
            Nouvelle collection disponibles
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl"
          >
            Découvrez des produits
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">exceptionnels</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mx-auto mb-8 max-w-2xl text-lg text-slate-300"
          >
            Parcourez notre sélection de produits de qualité. Des articles soigneusement choisis pour vous offrir le meilleur rapport qualité-prix.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate('/products')}
              className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg shadow-black/20 animate-pulse-glow"
            >
              Explorer les produits
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/products?category=electronique')}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Voir les catégories
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Trust badges */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
        className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {trusts.map(({ icon: Icon, title, desc }) => (
          <motion.div
            key={title}
            variants={fadeUp}
            className="rounded-xl border border-border bg-surface p-5 text-center transition-shadow hover:shadow-md"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <p className="font-semibold text-text">{title}</p>
            <p className="mt-1 text-xs text-text-muted">{desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Featured products */}
      <section className="mb-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text">Produits en vedette</h2>
            <p className="mt-1 text-sm text-text-muted">Les coups de cœur du moment</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/products')} className="hidden sm:inline-flex">
            Voir tout <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => (
                <motion.div key={product._id} variants={fadeUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))
          }
        </motion.div>
        <div className="mt-6 text-center sm:hidden">
          <Button variant="outline" onClick={() => navigate('/products')}>
            Voir tous les produits <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  )
}
