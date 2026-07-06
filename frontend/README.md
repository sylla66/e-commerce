# Mahdi boutique en ligne — Frontend

Application React 19 e-commerce avec panier persisté, catalogue, gestion de commandes, administration complète et multi-prestataires de paiement.

---

## Stack

- **Framework** : React 19 + Vite 8
- **Routage** : React Router v7
- **Requêtes HTTP** : Axios + TanStack Query v5
- **État** : Zustand 5 (panier persisté dans localStorage)
- **Styles** : Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Animation** : Framer Motion 12
- **Paiements** : Stripe Elements (@stripe/react-stripe-js)
- **UI Icons** : Lucide React
- **Lint** : Oxlint
- **Composants** : shadcn/ui-style (Radix primitives)

---

## Structure

```
src/
├── App.jsx                        # Routes principales
├── main.jsx                       # Point d'entrée
├── index.css                      # Tailwind v4 (@theme + keyframes)
├── lib/
│   └── utils.js                   # cn() pour classes Tailwind conditionnelles
├── store/
│   └── cartStore.js               # Zustand panier (persisté localStorage)
├── components/
│   ├── Layout.jsx                 # Layout principal (header, nav, page transition)
│   ├── ProductCard.jsx            # Carte produit (image, prix, badge promo)
│   └── ui/
│       ├── button.jsx             # Bouton multi-variants (shadcn style)
│       └── toaster.jsx            # Notifications toast (Context API)
├── hooks/
│   ├── useAuth.js                 # Auth store (login, logout, profile)
│   ├── useCategories.js           # TanStack Query pour catégories
│   ├── useOrders.js               # TanStack Query pour commandes
│   ├── useProducts.js             # TanStack Query pour produits
│   └── useStockMovements.js       # TanStack Query pour historique stock
├── services/
│   ├── api.js                     # Axios instance (intercepteur JWT + 401 redirect)
│   ├── authService.js             # Auth API calls
│   ├── cartService.js             # Cart API calls
│   ├── categoryService.js         # Category API calls
│   ├── customFieldService.js      # CustomField API calls
│   ├── orderService.js            # Order API calls
│   └── productService.js          # Product API calls
├── pages/
│   ├── HomePage.jsx               # Accueil (hero, featured products, trust badges)
│   ├── ProductsPage.jsx           # Catalogue (filtres, pagination, catégories)
│   ├── ProductDetailPage.jsx      # Détail produit (galerie, avis, add-to-cart)
│   ├── CartPage.jsx               # Panier (quantités, récapitulatif)
│   ├── CheckoutPage.jsx           # Checkout (adresse, transport, paiement)
│   ├── OrderSuccessPage.jsx       # Confirmation commande
│   ├── OrdersPage.jsx             # Mes commandes (liste)
│   ├── OrderDetailPage.jsx        # Détail commande (articles, statut, facture)
│   ├── PaymentSimulationPage.jsx  # Simulation paiement (dev)
│   ├── LoginPage.jsx              # Connexion
│   ├── RegisterPage.jsx           # Inscription
│   ├── admin/
│   │   ├── AdminLayout.jsx        # Layout admin (sidebar nav, responsive)
│   │   ├── AdminDashboard.jsx     # Dashboard (stats, graphiques, alertes stock)
│   │   ├── AdminProducts.jsx      # CRUD produits (inline stock edit)
│   │   ├── AdminCategories.jsx    # CRUD catégories
│   │   ├── AdminOrders.jsx        # Commandes (détail + assign custom fields)
│   │   ├── AdminUsers.jsx         # Gestion utilisateurs
│   │   ├── AdminActivities.jsx    # Logs d'activité
│   │   ├── AdminCustomFields.jsx  # CRUD champs personnalisés
│   │   ├── AdminReviews.jsx       # Gestion avis
│   │   └── AdminStockMovements.jsx # Historique mouvements de stock
│   └── manager/
│       └── ManagerOrders.jsx      # Interface manager simplifiée
```

---

## Installation

```bash
npm install
npm run dev          # Démarre sur http://localhost:5173
npm run build        # Build production dans dist/
npm run lint         # Oxlint
```

Le backend API doit tourner sur `http://localhost:5000` (proxy configuré dans `vite.config.js`).

---

## Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `VITE_STRIPE_PUBLIC_KEY` | Clé publique Stripe | — |

---

## Pages & Fonctionnalités

### Publiques

#### Accueil (`/`)
- Hero section avec CTA
- Badges de confiance (paiement sécurisé, livraison rapide, retour gratuit, support)
- Grille des produits en vedette (`isFeatured: true`)

#### Catalogue (`/products`)
- Catégories sous forme de pills cliquables
- Barre de recherche (full-text search MongoDB)
- Filtres : prix min/max, tri (prix, date, popularité)
- Pagination (12 par défaut)
- Cartes produit avec badge promo, image, stock

#### Détail produit (`/products/:slug`)
- Galerie d'images avec navigation (chevrons + miniatures)
- Animations Framer Motion (transitions d'images)
- Informations : prix, comparaison, description, attributs
- Sélecteur de quantité (+/-)
- Ajout au panier (sticky mobile)
- Section avis : notation par étoiles, formulaire (achat requis), suppression
- Breadcrumbs

#### Connexion / Inscription (`/login`, `/register`)
- Formulaire avec validation
- Redirection après connexion
- Inscription avec honeypot anti-spam (backend)

### Panier & Commandes

#### Panier (`/cart`)
- Liste des articles avec image, quantités (+/-), suppression
- Récapitulatif (sous-total, livraison, total)
- Lien vers checkout

#### Checkout (`/checkout`)
- 3 étapes : adresse → transport → paiement
- 3 moyens de paiement : Carte (Stripe Elements), Wave, Orange Money
- Stripe : formulaire embarqué avec `PaymentElement`
- Wave / Orange Money : redirection externe (ou simulation)

#### Mes commandes (`/orders`)
- Liste chronologique avec statut, montant

#### Détail commande (`/orders/:id`)
- Articles, adresse, statut
- Téléchargement facture PDF
- Suivi livraison

### Administration (`/admin`)

Accessible aux rôles `admin` et `manager`.

#### Dashboard
- Cartes : commandes total/mois, revenus total/mois, produits, catégories, utilisateurs
- Barres : commandes par statut
- Graphique : ventes quotidiennes (barres)
- Alertes : produits en stock faible
- Top produits les plus vendus
- Auto-refresh 60s

#### Produits
- Tableau + cartes mobiles
- Création modale
- Stock éditable inline (click → input → save)
- Badges : Rupture (rouge), Stock faible (orange), OK (vert)
- Lignes surlignées si stock ≤ 5

#### Catégories
- CRUD avec attributs déclaratifs

#### Commandes
- Filtre par statut
- Détail avec changements de statut
- Assignation de champs personnalisés (taxes, suppléments)
- Téléchargement facture PDF
- Export CSV

#### Utilisateurs
- CRUD utilisateurs (admin uniquement)
- Gestion des rôles

#### Activités
- Logs d'actions admin (changements de statut)

#### Champs personnalisés
- CRUD (nom, label, type: text/number/percentage/boolean/select)
- Appliqué aux catégories ou à toutes les commandes

#### Avis
- Liste complète avec modération (suppression)

#### Stock
- Historique chronologique des mouvements
- Filtre par produit
- Indicateur delta (+ vert / - rouge)

---

## Composants Réutilisables

### Button
```jsx
<Button variant="default|secondary|outline|ghost|danger|link" size="sm|md|lg|icon" asChild>
```

### ProductCard
```jsx
<ProductCard product={product} />         // Carte avec image, prix, badge promo
<ProductCardSkeleton />                    // État de chargement
```

### Toast
```jsx
const { toast } = useToast()
toast({ title: 'Succès', description: 'Ajouté au panier', variant: 'default|destructive' })
```

---

## Services API

### api.js
- Instance Axios avec `baseURL: /api/v1`
- Intercepteur : ajoute `Authorization: Bearer <token>` si présent
- Intercepteur réponse : redirection vers `/login` si 401 (sauf sur `/auth/login`)

### TanStack Query
```js
// staleTime: 5 min, retry: 1
// Cache invalidé automatiquement après mutations
```

---

## Panier (Zustand persisté)

- Stocké dans `localStorage` (clé: `cart-storage`)
- Fonctions : `addItem`, `updateQuantity`, `removeItem`, `clearCart`
- Calcul automatique : `totalQuantity`, `totalAmount`
- Persistance multi-session

---

## Routes

| Path | Page | Auth | Rôle |
|------|------|------|------|
| `/` | Accueil | — | — |
| `/products` | Catalogue | — | — |
| `/products/:slug` | Détail produit | — | — |
| `/cart` | Panier | — | — |
| `/checkout` | Checkout | user | — |
| `/orders` | Mes commandes | user | — |
| `/orders/:id` | Détail commande | user | — |
| `/orders/success` | Confirmation | user | — |
| `/payment/simulate` | Simulation | — | — |
| `/login` | Connexion | — | — |
| `/register` | Inscription | — | — |
| `/admin` | Dashboard | user | admin/manager |
| `/admin/products` | Produits | user | admin/manager |
| `/admin/categories` | Catégories | user | admin/manager |
| `/admin/orders` | Commandes | user | admin/manager |
| `/admin/users` | Utilisateurs | user | admin |
| `/admin/activities` | Activités | user | admin/manager |
| `/admin/custom-fields` | Champs perso. | user | admin/manager |
| `/admin/reviews` | Avis | user | admin/manager |
| `/admin/stock` | Stock | user | admin/manager |
| `/manager` | Gestion commandes | user | manager |

---

## Internationalisation

L'interface est entièrement en français.

## Styles (Tailwind v4)

Thème personnalisé dans `index.css` :
```css
@theme {
  --color-primary: #2563eb;
  --color-background: #f5f0eb;
  --color-surface: #fcf9f5;
  --color-text: #1f1b16;
  /* etc. */
}
```

Animations personnalisées : `fade-up`, `fade-in`, `slide-left`, `pulse-glow`, `float`.

## Build & Deploy

```bash
npm run build        # → dist/
```

Déploiement Vercel (vercel.json inclus) :
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "buildCommand": "npm run build",
  "framework": "vite"
}
```

---

## Dépendances clés

| Package | Utilisation |
|---------|-------------|
| `@stripe/react-stripe-js` | Paiement par carte |
| `@tanstack/react-query` | Cache serveur, mutations |
| `zustand` | État local panier |
| `framer-motion` | Animations pages et UI |
| `lucide-react` | Icônes |
| `clsx` + `tailwind-merge` | Classes conditionnelles |
| `@radix-ui/*` | Primitives accessibles (dialog, toast, slot) |
| `class-variance-authority` | Variants de composants |
