# Mahdi boutique en ligne — API Backend

Application e-commerce mono-vendeur avec API RESTful, authentification JWT, paiements multi-prestataires, PDF, emails, SMS, files d'attente et cache Redis.

---

## Stack

- **Runtime** : Node.js 20+ (CommonJS)
- **Framework** : Express 5
- **Base de données** : MongoDB + Mongoose 8
- **Cache / Queue** : Redis + BullMQ
- **Auth** : JWT (jsonwebtoken) + bcryptjs
- **Validation** : express-validator
- **Paiements** : Stripe, Wave, Orange Money (pattern Strategy)
- **Fichiers** : Multer + Cloudinary (optionnel)
- **PDF** : PDFKit
- **Emails** : Nodemailer (Ethereal fallback)
- **SMS** : Twilio (simulation fallback)
- **Tests** : Jest + Supertest

---

## Structure

```
src/
├── app.js                        # Configuration Express (middleware, routes, CORS, helmet)
├── server.js                     # Point d'entrée (connexion DB + démarrage)
├── seed.js                       # Script de seed (admin, catégories, 40+ produits)
├── config/
│   ├── db.js                     # Connexion MongoDB
│   ├── index.js                  # Variables d'environnement centralisées
│   └── redis.js                  # Client Redis (singleton lazy)
├── controllers/
│   ├── activityController.js     # GET admin/activities (log d'activité)
│   ├── adminController.js        # GET stats, GET export CSV commandes
│   ├── authController.js         # register, login, profile, refreshToken
│   ├── cartController.js         # GET, sync, addItem, updateItem, removeItem
│   ├── categoryController.js     # CRUD catégories
│   ├── customFieldController.js  # CRUD champs personnalisés
│   ├── invoiceController.js      # GET /orders/:id/invoice (PDF)
│   ├── orderController.js        # create, list, getById, adminList, updateStatus,
│   │                             #   createPaymentIntent, confirmPayment,
│   │                             #   getCustomFields, updateOrderCustomFields
│   ├── productController.js      # list, getBySlug, getById, create, update, remove,
│   │                             #   removeImage (+ cache Redis)
│   ├── reviewController.js       # getByProduct, create, adminList, remove
│   ├── stockController.js        # GET admin/stock/movements
│   ├── uploadController.js       # Upload d'images
│   └── userController.js         # CRUD utilisateurs (admin)
├── jobs/
│   └── queue.js                  # BullMQ queues (email, invoice, stock-sync, payment-webhook)
├── middleware/
│   ├── auth.js                   # authenticate, authorize, optionalAuth
│   ├── errorHandler.js           # Gestion d'erreurs globale
│   ├── rateLimiter.js            # authLimiter, apiLimiter
│   ├── upload.js                 # Multer (images, 10MB, Cloudinary ou disque)
│   └── validate.js               # Gestionnaire express-validator
├── models/
│   ├── ActivityLog.js            # Log des actions admin
│   ├── Cart.js                   # Panier (user ou session, items)
│   ├── Category.js               # Catégorie (parent/enfants, attributs déclaratifs)
│   ├── CustomField.js            # Champ personnalisé (taxe/frais)
│   ├── Order.js                  # Commande (items, adresse, customFields, statut)
│   ├── Payment.js                # Paiement (polymorphique: stripe, wave, orange_money)
│   ├── Product.js                # Produit (variants, attributs, stock, images)
│   ├── Review.js                 # Avis client (note, titre, commentaire)
│   ├── StockMovement.js          # Mouvement de stock (audit trail)
│   └── User.js                   # Utilisateur (rôles, adresses)
├── routes/
│   ├── admin.js                  # /api/v1/admin (stats, export CSV, stock movements)
│   ├── adminActivities.js        # /api/v1/admin/activities
│   ├── adminUsers.js             # /api/v1/admin/users
│   ├── auth.js                   # /api/v1/auth
│   ├── cart.js                   # /api/v1/cart
│   ├── categories.js             # /api/v1/categories
│   ├── customFields.js           # /api/v1/admin/custom-fields
│   ├── index.js                  # Agrégation de toutes les routes
│   ├── orders.js                 # /api/v1/orders
│   ├── products.js               # /api/v1/products
│   ├── reviews.js                # /api/v1/reviews
│   ├── upload.js                 # /api/v1/upload
│   └── webhook.js                # /api/v1/webhook (stripe, wave, orange-money)
├── services/
│   ├── emailService.js           # Emails (bienvenue, confirmation, statut, nouvel avis)
│   ├── invoiceService.js         # Génération PDF (PDFKit)
│   ├── paymentService.js         # Providers: StripeProvider, WaveProvider, OrangeMoneyProvider
│   └── smsService.js             # SMS Twilio (simulation si non configuré)
└── utils/
    ├── apiError.js               # Classe ApiError personnalisée
    └── generateToken.js          # JWT generation (access + refresh)
```

---

## Installation

```bash
# Prérequis: Node.js 20+, MongoDB, Redis
npm install
cp .env.example .env   # Configurer les variables
npm run seed            # Peuple la DB avec 3 utilisateurs, 6 catégories, 40+ produits
npm run dev             # Démarre avec nodemon
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm start` | Démarrage production |
| `npm run dev` | Démarrage développement (nodemon) |
| `npm test` | Tests Jest (--runInBand) |
| `npm run seed` | Seed de la base de données |

---

## Variables d'environnement (.env)

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port serveur | `5000` |
| `NODE_ENV` | Environnement | `development` |
| `MONGODB_URI` | URI MongoDB | `mongodb://localhost:27017/ecommerce` |
| `JWT_SECRET` | Clé secrète JWT | `dev_secret` |
| `JWT_EXPIRES_IN` | Durée validité JWT | `7d` |
| `REDIS_URL` | URL Redis | `redis://localhost:6379` |
| `FRONTEND_URL` | URL du frontend (CORS) | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary | — |
| `CLOUDINARY_API_KEY` | Cloudinary | — |
| `CLOUDINARY_API_SECRET` | Cloudinary | — |
| `STRIPE_SECRET_KEY` | Stripe | — |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook | — |
| `WAVE_API_KEY` | Wave | — |
| `WAVE_API_SECRET` | Wave | — |
| `ORANGE_MONEY_CLIENT_ID` | Orange Money | — |
| `ORANGE_MONEY_CLIENT_SECRET` | Orange Money | — |
| `EMAIL_HOST` | SMTP host | — (Ethereal fallback) |
| `EMAIL_USER` / `EMAIL_PASS` | SMTP auth | — |
| `EMAIL_FROM` | Expéditeur | `noreply@boutique.sn` |
| `TWILIO_ACCOUNT_SID` | Twilio | — (simulation) |
| `TWILIO_AUTH_TOKEN` | Twilio | — |
| `TWILIO_FROM` | Numéro Twilio | — |

---

## Modèles de données

### User
| Champ | Type | Contraintes |
|-------|------|-------------|
| email | String | unique, lowercase, requis |
| password | String | bcrypt, select:false, min 8 |
| firstName / lastName | String | requis |
| phone | String | — |
| role | String | enum: customer, manager, admin |
| isActive | Boolean | défaut true |
| addresses | [Address] | sous-documents (label, street, city, etc.) |

### Product
| Champ | Type | Contraintes |
|-------|------|-------------|
| name | String | requis, trim |
| slug | String | unique, lowercase, requis |
| description / shortDescription | String | — |
| category | ObjectId | ref Category, requis |
| images | [String] | URLs |
| attributes | Map (Mixed) | flexible, ex: { marque: 'Samsung', couleur: 'Noir' } |
| variants | [Variant] | sous-documents (sku, price, stock, attributes) |
| basePrice / comparePrice | Number | min 0 |
| stock | Number | min 0 |
| sku | String | unique sparse |
| isActive / isFeatured | Boolean | — |
| tags | [String] | lowercase |
| averageRating / reviewCount | Number | calculés depuis Review |

### Category
| Champ | Type | Contraintes |
|-------|------|-------------|
| name / slug / description | String | — |
| parent | ObjectId | self-ref |
| image | String | URL |
| isActive | Boolean | défaut true |
| attributes | [AttributeSchema] | déclaratif (name, label, type, options, required) |

### Order
| Champ | Type | Contraintes |
|-------|------|-------------|
| user | ObjectId | ref User |
| orderNumber | String | généré auto (ORD-YYYYMM-NNNNN) |
| items | [OrderItem] | product, name, quantity, unitPrice, totalPrice, image |
| shippingAddress | Address | street, city, region, zip, country |
| shippingCost / subtotal | Number | — |
| customFields | [CustomFieldValue] | ref CustomField, valeur, montant |
| totalSurcharges / taxAmount / totalAmount | Number | — |
| status | String | pending → confirmed → processing → shipped → delivered / cancelled / refunded |
| payment | ObjectId | ref Payment |
| trackingNumber / invoiceNumber | String | — |

### Payment
| Champ | Type | Contraintes |
|-------|------|-------------|
| order | ObjectId | ref Order |
| provider | String | stripe, wave, orange_money |
| providerPaymentId | String | ID chez le prestataire |
| amount | Number | — |
| currency | String | défaut XOF |
| status | String | pending, succeeded, failed, refunded |
| metadata | Mixed | données spécifiques (clientSecret, checkoutUrl) |

### Review
| Champ | Type | Contraintes |
|-------|------|-------------|
| product | ObjectId | ref Product |
| user | ObjectId | ref User |
| rating | Number | 1-5, requis |
| title / comment | String | max 100 / 2000 |
| isVerified | Boolean | défaut true |

### StockMovement
| Champ | Type | Contraintes |
|-------|------|-------------|
| product | ObjectId | ref Product |
| variantSku | String | optionnel |
| previousStock / newStock / delta | Number | — |
| reason | String | order_created, order_cancelled, order_refunded, admin_update, restock, manual |
| referenceType | String | Order, Product |
| referenceId | ObjectId | — |
| user | ObjectId | ref User |

---

## API Routes

### Auth (`/api/v1/auth`)

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/register` | — | Inscription |
| POST | `/login` | — | Connexion |
| POST | `/admin/create-user` | admin | Créer un utilisateur |
| GET | `/profile` | user | Profil |
| PATCH | `/profile` | user | Modifier profil |
| POST | `/refresh-token` | — | Rafraîchir JWT |

### Produits (`/api/v1/products`)

| Méthode | Route | Auth | Cache | Description |
|---------|-------|------|-------|-------------|
| GET | `/` | — | 300s | Liste (filtres: category, search, minPrice, maxPrice, sort, featured, page, limit) |
| GET | `/:slug` | — | 600s | Détail par slug |
| GET | `/id/:id` | — | 600s | Détail par ID |
| POST | `/` | admin/manager | — | Créer |
| PATCH | `/:id` | admin/manager | — | Modifier (+ audit stock) |
| DELETE | `/:id` | admin/manager | — | Supprimer |
| DELETE | `/:id/image` | admin/manager | — | Supprimer une image |

### Catégories (`/api/v1/categories`)

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/` | — | Liste (query: `all=true` pour inactives) |
| GET | `/:slug` | — | Détail |
| POST | `/` | admin/manager | Créer |
| PATCH | `/:id` | admin/manager | Modifier |
| DELETE | `/:id` | admin/manager | Supprimer |

### Panier (`/api/v1/cart`)

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/` | — | Voir (user ou sessionId header) |
| POST | `/sync` | — | Synchroniser |
| POST | `/items` | — | Ajouter item |
| PATCH | `/items/:itemId` | — | Modifier quantité |
| DELETE | `/items/:itemId` | — | Supprimer item |

### Commandes (`/api/v1/orders`)

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/` | user | Créer (depuis panier ou body items) |
| GET | `/` | user | Mes commandes |
| GET | `/admin` | admin/manager | Toutes les commandes |
| GET | `/:id` | user/admin | Détail |
| GET | `/:id/invoice` | user/admin | PDF facture |
| GET | `/custom-fields/active` | admin/manager | Champs personnalisés actifs |
| PATCH | `/:id/status` | admin/manager | Changer statut (+ email + SMS + stock restore) |
| PATCH | `/:id/custom-fields` | admin/manager | Assigner champs personnalisés |
| POST | `/:id/pay` | user | Créer intention de paiement |
| POST | `/confirm-payment` | user | Confirmer paiement |

### Avis (`/api/v1/reviews`)

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/product/:slug` | — | Avis d'un produit |
| POST | `/` | user | Créer (achat requis) |
| GET | `/admin` | admin/manager | Tous les avis |
| DELETE | `/:id` | user/admin | Supprimer |

### Admin (`/api/v1/admin`)

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/stats` | admin/manager | Dashboard (overview, ordersByStatus, lowStock, dailySales, topProducts) |
| GET | `/orders/export` | admin/manager | CSV commandes (filtres: status, from, to) |
| GET | `/stock/movements` | admin/manager | Historique stock (filtres: productId, reason, page) |
| GET | `/activities` | admin/manager | Logs d'activité |
| GET/POST/PATCH/DELETE | `/users` | admin | CRUD utilisateurs |
| GET/POST/PATCH/DELETE | `/custom-fields` | admin/manager | CRUD champs personnalisés |

### Webhooks (`/api/v1/webhook`)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/stripe` | Webhook Stripe |
| POST | `/wave` | Webhook Wave |
| POST | `/orange-money` | Webhook Orange Money |

---

## Services

### Paiements (Strategy Pattern)

```js
const { paymentService } = require('./services/paymentService');
const provider = paymentService.getProvider('stripe');
await provider.createPayment(order);
```

Trois providers implémentent l'interface `PaymentProvider` :
- **StripeProvider** : PaymentIntents, webhooks sécurisés (signature)
- **WaveProvider** : API Wave, simulation si WAVE_API_KEY absent
- **OrangeMoneyProvider** : API Orange, OAuth2, simulation si non configuré

### Emails (Nodemailer)

| Fonction | Déclencheur |
|----------|-------------|
| `sendWelcomeEmail` | Inscription |
| `sendOrderConfirmation` | Création de commande (via BullMQ) |
| `sendOrderStatusUpdate` | Changement de statut |
| `sendNewReviewNotification` | Nouvel avis (BCC aux admins) |

Fallback automatique vers Ethereal (compte test) si SMTP non configuré.

### SMS (Twilio)

| Fonction | Déclencheur | Simulation |
|----------|-------------|------------|
| `sendOrderStatusSMS` | Changement de statut | Oui (log console si TWILIO_* absent) |

### Cache Redis

- `products:list:{queryJSON}` — TTL 300s (liste de produits)
- `product:slug:{slug}` — TTL 600s (détail par slug)
- `product:id:{id}` — TTL 600s (détail par ID)
- Cache busté automatiquement sur create/update/delete

### Stock Audit Trail

Enregistré automatiquement dans `StockMovement` :
- Création de commande → `order_created`
- Annulation/remboursement → `order_cancelled` / `order_refunded`
- Modification admin du stock → `admin_update`

---

## Tests

```bash
npm test
# 5 suites, 34 tests — nécessite MongoDB + Redis (ou fallback simulation)
```

Les tests tournent en séquentiel (`--runInBand`) pour éviter les conflits de base de données partagée.

---

## Déploiement

### Docker

```bash
docker build -t mahdi-boutique-api .
docker run -p 5000:5000 mahdi-boutique-api
```

### Render (render.yaml)

Déploiement via Render blueprint : variables d'environnement sensibles marquées `sync: false`.

### Exigences

- MongoDB (Atlas ou Docker)
- Redis (Upstash, Redis Cloud ou Docker)
- Variables d'environnement en production

---

## Comptes de test (seed)

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | `admin@boutique.sn` | `admin123` |
| Manager | `manager@boutique.sn` | `manager123` |
| Client | `client@example.com` | `client123` |

---

## Sécurité

- Helmet (en-têtes HTTP)
- CORS restreint (origin frontend)
- Rate limiting (auth: 10 req/15min, API: 200 req/15min)
- JWT avec refresh token
- bcrypt pour les mots de passe
- express-validator sur routes critiques
- Honeypot anti-spam sur inscription
- Limite 10MB sur uploads (images uniquement)
