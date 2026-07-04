export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-text">Ma Boutique</h1>
          <nav className="flex items-center gap-4">
            <a href="/products" className="text-text-muted hover:text-text">
              Produits
            </a>
            <a href="/cart" className="text-text-muted hover:text-text">
              Panier
            </a>
            <a href="/login" className="text-text-muted hover:text-text">
              Connexion
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12">
        <section className="mb-12 text-center">
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
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg border border-border bg-surface p-4"
              >
                <div className="mb-4 h-48 rounded-md bg-muted" />
                <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
