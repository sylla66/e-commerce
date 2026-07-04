const mongoose = require('mongoose');
const config = require('./config');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

const PICSUM = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

const categories = [
  {
    name: 'Électronique', slug: 'electronique',
    description: 'Smartphones, ordinateurs, tablettes, accessoires tech',
    image: PICSUM('electronique'),
    attributes: [
      { name: 'marque', label: 'Marque', type: 'text', required: true },
      { name: 'modele', label: 'Modèle', type: 'text' },
      { name: 'couleur', label: 'Couleur', type: 'text' },
      { name: 'garantie', label: 'Garantie (mois)', type: 'number', unit: 'mois' },
    ],
  },
  {
    name: 'Mode', slug: 'mode',
    description: 'Vêtements, chaussures, sacs, accessoires de mode',
    image: PICSUM('mode'),
    attributes: [
      { name: 'taille', label: 'Taille', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44'] },
      { name: 'couleur', label: 'Couleur', type: 'color' },
      { name: 'matiere', label: 'Matière', type: 'text' },
    ],
  },
  {
    name: 'Alimentation', slug: 'alimentation',
    description: 'Produits frais, épicerie, boissons, spécialités africaines',
    image: PICSUM('alimentation'),
    attributes: [
      { name: 'poids', label: 'Poids (g)', type: 'number', unit: 'g' },
      { name: 'origine', label: 'Origine', type: 'text' },
      { name: 'conservation', label: 'Conservation', type: 'text' },
    ],
  },
  {
    name: 'Maison & Déco', slug: 'maison',
    description: 'Mobilier, décoration, art artisanal, ustensiles',
    image: PICSUM('maison'),
    attributes: [
      { name: 'matiere', label: 'Matière', type: 'text' },
      { name: 'dimensions', label: 'Dimensions', type: 'text' },
      { name: 'artisan', label: 'Artisan', type: 'text' },
    ],
  },
  {
    name: 'Sport & Loisirs', slug: 'sport',
    description: 'Équipement sportif, fitness, jeux, outdoor',
    image: PICSUM('sport'),
    attributes: [
      { name: 'marque', label: 'Marque', type: 'text' },
      { name: 'poids', label: 'Poids (g)', type: 'number', unit: 'g' },
      { name: 'niveau', label: 'Niveau', type: 'select', options: ['Débutant', 'Intermédiaire', 'Avancé', 'Professionnel'] },
    ],
  },
  {
    name: 'Santé & Beauté', slug: 'sante-beaute',
    description: 'Soins visage, corps, cheveux, bien-être',
    image: PICSUM('beaute'),
    attributes: [
      { name: 'marque', label: 'Marque', type: 'text' },
      { name: 'type', label: 'Type de peau/cheveux', type: 'text' },
      { name: 'contenance', label: 'Contenance (ml)', type: 'number', unit: 'ml' },
    ],
  },
];

const products = [
  // === ÉLECTRONIQUE ===
  {
    name: 'Smartphone Galaxy S24 Ultra', slug: 'galaxy-s24-ultra',
    description: 'Smartphone haut de gamme avec écran Dynamic AMOLED 6.8", 256Go, appareil photo 200MP, processeur Exynos 2400. Batterie 5000mAh avec charge rapide 45W.',
    shortDescription: '256Go, 200MP, S Pen intégré',
    basePrice: 650000, comparePrice: 750000, stock: 12, sku: 'S24U-256',
    categorySlug: 'electronique',
    images: [`https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=600&h=600&fit=crop`, PICSUM('phone1'), PICSUM('phone2')],
    attributes: { marque: 'Samsung', modele: 'Galaxy S24 Ultra', couleur: 'Noir titane', garantie: '24' },
    isFeatured: true,
  },
  {
    name: 'MacBook Air M3 15"', slug: 'macbook-air-m3',
    description: 'Ordinateur portable Apple avec puce M3, écran Liquid Retina 15.3", 16Go RAM, 512Go SSD. Autonomie jusqu\'à 18h. Idéal pour le travail et la création.',
    shortDescription: 'M3 16Go/512Go, 18h autonomie',
    basePrice: 1200000, comparePrice: 1350000, stock: 8, sku: 'MBA-M3-512',
    categorySlug: 'electronique',
    images: [PICSUM('macbook1'), PICSUM('macbook2'), `https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop`],
    attributes: { marque: 'Apple', modele: 'MacBook Air M3', couleur: 'Gris sidéral', garantie: '12' },
    isFeatured: true,
  },
  {
    name: 'AirPods Pro 2 USB-C', slug: 'airpods-pro-2',
    description: 'Écouteurs sans fil Apple avec réduction de bruit active, audio spatial personnalisé, boîtier USB-C MagSafe. Autonomie 6h par écouteur.',
    shortDescription: 'Réduction bruit, USB-C, Spatial Audio',
    basePrice: 185000, comparePrice: 220000, stock: 25, sku: 'APP2-USB',
    categorySlug: 'electronique',
    images: [`https://images.unsplash.com/photo-1600294037681-c80b4cb5b6e8?w=600&h=600&fit=crop`, PICSUM('airpods2')],
    attributes: { marque: 'Apple', modele: 'AirPods Pro 2', couleur: 'Blanc', garantie: '12' },
  },
  {
    name: 'Montre Connectée Garmin Venu 3', slug: 'garmin-venu-3',
    description: 'Montre GPS connectée avec écran AMOLED, suivi santé avancé (ECG, SpO2, sommeil), 200+ modes sport, batterie 14 jours. Idéale pour le fitness et la santé.',
    shortDescription: 'AMOLED, GPS, ECG, 14j autonomie',
    basePrice: 350000, stock: 10, sku: 'GV3-001',
    categorySlug: 'electronique',
    images: [PICSUM('watch1'), PICSUM('watch2')],
    attributes: { marque: 'Garmin', modele: 'Venu 3', couleur: 'Noir', garantie: '24' },
  },
  {
    name: 'Enceinte JBL Flip 6', slug: 'jbl-flip-6',
    description: 'Enceinte Bluetooth portable JBL Flip 6, son puissant et équilibré, certification IP67 (étanche), autonomie 12h. Parfaite pour la plage ou la maison.',
    shortDescription: 'IP67, 12h batterie, son puissant',
    basePrice: 75000, stock: 40, sku: 'JBL-F6',
    categorySlug: 'electronique',
    images: [`https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop`, PICSUM('jbl2')],
    attributes: { marque: 'JBL', modele: 'Flip 6', couleur: 'Bleu', garantie: '12' },
  },
  {
    name: 'Tablette iPad Air M2 11"', slug: 'ipad-air-m2',
    description: 'Tablette Apple iPad Air avec puce M2, écran Liquid Retina 11", 128Go, compatible Apple Pencil Pro. Parfaite pour le dessin, la prise de notes et le divertissement.',
    shortDescription: 'M2 128Go, Liquid Retina 11"',
    basePrice: 550000, stock: 15, sku: 'IPA-M2-128',
    categorySlug: 'electronique',
    images: [PICSUM('ipad1'), PICSUM('ipad2')],
    attributes: { marque: 'Apple', modele: 'iPad Air M2', couleur: 'Violet', garantie: '12' },
  },

  // === MODE ===
  {
    name: 'Chemise Wax Africaine', slug: 'chemise-wax-africaine',
    description: 'Magnifique chemise en tissu wax africain 100% coton, coupe moderne et élégante. Parfaite pour les cérémonies, le bureau ou les sorties. Chaque pièce est unique.',
    shortDescription: '100% coton, wax authentique, coupe moderne',
    basePrice: 25000, stock: 30, sku: 'CWX-001',
    categorySlug: 'mode',
    images: [PICSUM('wax1'), PICSUM('wax2'), PICSUM('wax3')],
    attributes: { taille: 'L', couleur: '#e74c3c', matiere: 'Coton wax africain' },
    isFeatured: true,
  },
  {
    name: 'Boubou Sénégalais Brodé', slug: 'boubou-senegalais-brode',
    description: 'Boubou traditionnel sénégalais en bazin riche, avec broderies faites main au fil doré. Tenue de cérémonie haut de gamme, confectionnée par des artisans dakarois.',
    shortDescription: 'Bazin riche, broderie dorée, fait main',
    basePrice: 85000, comparePrice: 120000, stock: 8, sku: 'BSB-001',
    categorySlug: 'mode',
    images: [PICSUM('boubou1'), PICSUM('boubou2')],
    attributes: { taille: 'XL', couleur: '#1a5276', matiere: 'Bazin riche' },
    isFeatured: true,
  },
  {
    name: 'Sac à Main en Cuir Artisanal', slug: 'sac-cuir-artisanal',
    description: 'Sac à main en cuir véritable tanné au Sénégal, fabriqué par des artisans de la région de Thiès. Doublure intérieure en pagne africain, fermeture magnétique.',
    shortDescription: 'Cuir véritable, fait main au Sénégal',
    basePrice: 45000, stock: 15, sku: 'SCA-001',
    categorySlug: 'mode',
    images: [`https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop`, PICSUM('bag2'), PICSUM('bag3')],
    attributes: { taille: 'M', couleur: '#8b4513', matiere: 'Cuir véritable' },
    isFeatured: true,
  },
  {
    name: 'Baskets Nike Air Max Pulse', slug: 'nike-air-max-pulse',
    description: 'Baskets Nike Air Max Pulse, design futuriste avec bulle Air visible, empeigne en mesh respirant, semelle ultra-confortable. Idéales pour le sport et le quotidien.',
    shortDescription: 'Air Max, mesh respirant, confort ultime',
    basePrice: 95000, comparePrice: 130000, stock: 22, sku: 'NAP-001',
    categorySlug: 'mode',
    images: [`https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop`, PICSUM('nike2')],
    attributes: { taille: '42', couleur: '#e74c3c', matiere: 'Mesh, synthétique' },
  },
  {
    name: 'Lunettes de Soleil Premium', slug: 'lunettes-soleil-premium',
    description: 'Lunettes de soleil au design intemporel, monture en acétate de qualité, verres polarisés anti-UV400. Étui rigide et chiffon inclus.',
    shortDescription: 'Acétate, verres polarisés UV400',
    basePrice: 35000, stock: 40, sku: 'LSP-001',
    categorySlug: 'mode',
    images: [`https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop`, PICSUM('glasses2')],
    attributes: { taille: 'M', couleur: '#1a1a1a', matiere: 'Acétate' },
  },

  // === ALIMENTATION ===
  {
    name: 'Huile de Coco Bio Sénégalaise', slug: 'huile-coco-bio',
    description: 'Huile de coco vierge bio pressée à froid, issue de noix de coco du Bassin arachidier. 100% pure, sans additifs. Utilisable en cuisine, cosmétique et soins capillaires.',
    shortDescription: 'Vierge bio, pressée à froid, 500ml',
    basePrice: 4500, stock: 200, sku: 'HCB-500',
    categorySlug: 'alimentation',
    images: [PICSUM('coco1'), PICSUM('coco2')],
    attributes: { poids: '500', origine: 'Sénégal (Bassin arachidier)', conservation: 'À l\'abri de la chaleur' },
  },
  {
    name: 'Thé Attaya Menthe Premium', slug: 'the-attaya-menthe',
    description: 'Thé vert Gunpowder premium importé de Chine, mélangé à de la menthe fraîche du Sénégal. Lot de 200g en boîte hermétique. La base de l\'attaya sénégalais.',
    shortDescription: 'Gunpowder premium, menthe fraîche, 200g',
    basePrice: 3500, stock: 300, sku: 'TAM-200',
    categorySlug: 'alimentation',
    images: [PICSUM('tea1'), PICSUM('tea2')],
    attributes: { poids: '200', origine: 'Sénégal / Chine', conservation: 'Dans un endroit sec et frais' },
  },
  {
    name: 'Miel de Casamance Pur', slug: 'miel-casamance',
    description: 'Miel 100% pur récolté par les apiculteurs traditionnels de Casamance. Non pasteurisé, non filtré, riche en enzymes et nutriments. Pot de 500g.',
    shortDescription: 'Pur, non filtré, 500g, Casamance',
    basePrice: 6000, stock: 150, sku: 'MCP-500',
    categorySlug: 'alimentation',
    images: [PICSUM('miel1'), PICSUM('miel2')],
    attributes: { poids: '500', origine: 'Sénégal (Casamance)', conservation: 'Température ambiante' },
  },
  {
    name: 'Riz Parfumé Thiass', slug: 'riz-thiass-parfume',
    description: 'Riz parfumé de haute qualité, cultivé dans la vallée du fleuve Sénégal. Sac de 5kg, idéal pour le thiéboudiène et les plats traditionnels.',
    shortDescription: 'Cultivé au Sénégal, sac 5kg',
    basePrice: 7500, comparePrice: 9000, stock: 500, sku: 'RTP-5K',
    categorySlug: 'alimentation',
    images: [PICSUM('riz1')],
    attributes: { poids: '5000', origine: 'Sénégal (Vallée du fleuve)', conservation: 'Dans un endroit sec' },
  },
  {
    name: 'Beurre de Karité Bio', slug: 'beurre-karite-bio',
    description: 'Beurre de karité pur bio extrait par les femmes rurales du Sénégal. Riche en vitamines A et E, idéal pour les soins de la peau et des cheveux. Pot 250g.',
    shortDescription: 'Pur bio, 250g, fabriqué par des femmes rurales',
    basePrice: 3500, stock: 120, sku: 'BKB-250',
    categorySlug: 'alimentation',
    images: [PICSUM('karite1')],
    attributes: { poids: '250', origine: 'Sénégal (Kaffrine)', conservation: 'Température ambiante' },
  },
  {
    name: 'Jus de Bissap Bio', slug: 'jus-bissap-bio',
    description: 'Jus de bissap (hibiscus) bio concentré, fabriqué artisanalement à partir de fleurs d\'hibiscus séchées de la région de Fatick. Sans conservateurs. Bouteille 75cl.',
    shortDescription: 'Bio, artisanal, 75cl, sans conservateurs',
    basePrice: 2500, stock: 250, sku: 'JBB-75',
    categorySlug: 'alimentation',
    images: [PICSUM('bissap1')],
    attributes: { poids: '750', origine: 'Sénégal (Fatick)', conservation: 'Réfrigérer après ouverture' },
  },

  // === MAISON & DÉCO ===
  {
    name: 'Statue Artisanale en Bois', slug: 'statue-bois-artisanale',
    description: 'Statue sculptée à la main dans du bois de Sipo par les artisans de la région de Ziguinchor. Représente une figure maternelle traditionnelle. Pièce unique numérotée.',
    shortDescription: 'Sculptée main, bois Sipo, pièce unique',
    basePrice: 55000, stock: 6, sku: 'SBA-001',
    categorySlug: 'maison',
    images: [PICSUM('statue1'), PICSUM('statue2')],
    attributes: { matiere: 'Bois Sipo', dimensions: '35x12x12 cm', artisan: 'Mamadou Diallo (Ziguinchor)' },
    isFeatured: true,
  },
  {
    name: 'Corbeille Tressée Couleur', slug: 'corbeille-tressee-couleur',
    description: 'Corbeille décorative tressée à la main en fibres de rônier, teintée avec des colorants naturels. Parfaite pour le rangement ou comme pièce décorative.',
    shortDescription: 'Rônier, teinture naturelle, faite main',
    basePrice: 12000, stock: 25, sku: 'CTC-001',
    categorySlug: 'maison',
    images: [PICSUM('corbeille1')],
    attributes: { matiere: 'Fibres de rônier', dimensions: '30x30x20 cm', artisan: 'Aminata Sow (Thiès)' },
  },
  {
    name: 'Set de Table en Pagne Wax', slug: 'set-table-pagne-wax',
    description: 'Set de 6 sets de table et 6 dessous de verre en pagne wax africain associé à du lin. Chaque set est unique. Lavable en machine à 30°C.',
    shortDescription: '6 sets + 6 dessous, wax + lin, lavable',
    basePrice: 15000, stock: 35, sku: 'STP-001',
    categorySlug: 'maison',
    images: [PICSUM('waxset1'), PICSUM('waxset2')],
    attributes: { matiere: 'Pagne wax, lin', dimensions: '40x30 cm (set)', artisan: 'Collectif Soumpa (Dakar)' },
  },
  {
    name: 'Lampe Boule Artisanale', slug: 'lampe-boule-artisanale',
    description: 'Lampe boule en verre soufflé et rotin tressé, fabriquée par des artisans verriers. Crée une ambiance chaleureuse. Ampoule LED incluse. Câble tissé 2m.',
    shortDescription: 'Verre soufflé + rotin, LED incluse',
    basePrice: 28000, stock: 12, sku: 'LBA-001',
    categorySlug: 'maison',
    images: [`https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=600&fit=crop`, PICSUM('lampe2')],
    attributes: { matiere: 'Verre soufflé, rotin', dimensions: 'Diamètre 30cm, câble 2m', artisan: 'Atelier Souffle d\'Afrique (Saint-Louis)' },
  },
  {
    name: 'Coussin Décoratif Wax', slug: 'coussin-decoratif-wax',
    description: 'Coussin décoratif 45x45cm en pagne wax africain authentique, avec fermeture à glissière. Housse amovible et lavable. Remplissage en fibres polyester.',
    shortDescription: '45x45cm, wax authentique, housse amovible',
    basePrice: 9500, stock: 50, sku: 'CDW-001',
    categorySlug: 'maison',
    images: [PICSUM('coussin1'), PICSUM('coussin2')],
    attributes: { matiere: 'Pagne wax, polyester', dimensions: '45x45 cm' },
  },

  // === SPORT & LOISIRS ===
  {
    name: 'Ballon de Foot Sénégal', slug: 'ballon-foot-senegal',
    description: 'Ballon de football officiel taille 5, aux couleurs du Sénégal. En cuir synthétique de haute résistance, couture thermique. Testé FIFA Quality.',
    shortDescription: 'Taille 5, cuir synthétique, FIFA Quality',
    basePrice: 18000, stock: 60, sku: 'BFS-001',
    categorySlug: 'sport',
    images: [PICSUM('ballon1'), PICSUM('ballon2')],
    attributes: { marque: 'SenSport', poids: '450', niveau: 'Intermédiaire' },
    isFeatured: true,
  },
  {
    name: 'Tapis de Yoga Premium', slug: 'tapis-yoga-premium',
    description: 'Tapis de yoga en TPE écologique, épaisseur 6mm, antidérapant des deux côtés. Dimensions 183x61cm. Avec sangle de transport incluse.',
    shortDescription: 'TPE eco, 6mm, antidérapant, sangle incluse',
    basePrice: 22000, stock: 45, sku: 'TYP-001',
    categorySlug: 'sport',
    images: [`https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop`, PICSUM('yoga2')],
    attributes: { marque: 'ZenFit', poids: '1200', niveau: 'Débutant' },
  },
  {
    name: 'VTT Tout Terrain 27.5"', slug: 'vtt-tout-terrain',
    description: 'VTT cadre aluminium 27.5", suspension avant 100mm, freins à disque hydrauliques, 21 vitesses Shimano. Parfait pour les sorties sportives et les chemins.',
    shortDescription: '27.5", alu, suspension 100mm, Shimano 21v',
    basePrice: 250000, stock: 5, sku: 'VTT-001',
    categorySlug: 'sport',
    images: [`https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=600&h=600&fit=crop`, PICSUM('vtt2')],
    attributes: { marque: 'TrailMaster', poids: '14000', niveau: 'Intermédiaire' },
  },
  {
    name: 'Paddle Gonflable SUP', slug: 'paddle-gonflable-sup',
    description: 'Planche de paddle gonflable, dimensions 305x80x15cm, matériau drop-stitch double couche. Pompe, pagaie, leash et sac de transport inclus.',
    shortDescription: '305cm, drop-stitch, kit complet',
    basePrice: 120000, stock: 8, sku: 'SUP-001',
    categorySlug: 'sport',
    images: [PICSUM('paddle1')],
    attributes: { marque: 'AquaRide', poids: '9500', niveau: 'Débutant' },
  },

  // === SANTÉ & BEAUTÉ ===
  {
    name: "Savon Noir au Beurre de Karité", slug: 'savon-noir-karite',
    description: 'Savon noir artisanal enrichi au beurre de karité et à l\'huile de coco. Nettoie en douceur, exfolie naturellement et hydrate la peau. Idéal pour les peaux sèches.',
    shortDescription: 'Artisanal, karité, coco, peau sèche',
    basePrice: 2500, stock: 200, sku: 'SNK-001',
    categorySlug: 'sante-beaute',
    images: [PICSUM('savon1'), PICSUM('savon2')],
    attributes: { marque: 'SenNaturel', type: 'Peau sèche à normale', contenance: '150' },
  },
  {
    name: 'Huile de Nuit Anti-Âge', slug: 'huile-nuit-anti-age',
    description: 'Huile de visage bio à l\'huile de baobab, moringa et vitamine E. Régénère et nourrit la peau pendant la nuit. Réduit les rides et ridules. Flacon 30ml.',
    shortDescription: 'Baobab, moringa, vit E, anti-âge, 30ml',
    basePrice: 8500, stock: 75, sku: 'HNA-30',
    categorySlug: 'sante-beaute',
    images: [PICSUM('huile1'), PICSUM('huile2')],
    attributes: { marque: 'Baobab Essentiel', type: 'Tous types de peaux', contenance: '30' },
    isFeatured: true,
  },
  {
    name: 'Gel Aloe Vera Pure', slug: 'gel-aloe-vera-pure',
    description: 'Gel d\'aloe vera 100% pur, extrait de feuilles fraîches cultivées au Sénégal. Apaise les coups de soleil, hydrate en profondeur, régénère la peau. Sans parfum ajouté.',
    shortDescription: '100% pur, sénégalais, apaisant, 200ml',
    basePrice: 4000, stock: 150, sku: 'GAV-200',
    categorySlug: 'sante-beaute',
    images: [PICSUM('aloe1')],
    attributes: { marque: 'AloeSénégal', type: 'Tous types de peaux', contenance: '200' },
  },
  {
    name: 'Baume à Lèvres au Miel', slug: 'baume-levres-miel',
    description: 'Baume à lèvres naturel au miel de Casamance et beurre de karité. Hydrate et protège les lèvres. Format stick 5g. Sans colorants ni parfums artificiels.',
    shortDescription: 'Miel + karité, naturel, stick 5g',
    basePrice: 1500, stock: 300, sku: 'BLM-5',
    categorySlug: 'sante-beaute',
    images: [PICSUM('baume1')],
    attributes: { marque: 'SenNaturel', type: 'Tous types de peaux', contenance: '5' },
  },
];

async function seed() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    const admin = await User.create({
      email: 'admin@boutique.sn',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'Boutique',
      role: 'admin',
      phone: '+221 77 123 45 67',
      addresses: [{ label: 'Boutique', street: '13 Rue de Paris', city: 'Dakar', isDefault: true }],
    });
    console.log(`[OK] Admin: admin@boutique.sn / admin123`);

    const customer = await User.create({
      email: 'client@example.com',
      password: 'client123',
      firstName: 'Moussa',
      lastName: 'Diop',
      role: 'customer',
      phone: '+221 78 123 45 67',
      addresses: [{ label: 'Domicile', street: '15 Rue Mermoz', city: 'Dakar', isDefault: true }],
    });
    console.log(`[OK] Client: client@example.com / client123`);

    const createdCategories = {};
    for (const cat of categories) {
      const created = await Category.create(cat);
      createdCategories[cat.slug] = created._id;
      console.log(`[OK] Catégorie: ${cat.name}`);
    }

    for (const p of products) {
      const { categorySlug, ...rest } = p;
      const variants = p.variants || [];
      await Product.create({
        ...rest,
        category: createdCategories[categorySlug],
        tags: [categorySlug, ...rest.name.toLowerCase().split(' ').slice(0, 5)],
        searchText: `${rest.name} ${rest.shortDescription || ''} ${rest.description}`,
        variants,
      });
      console.log(`[OK] Produit: ${rest.name}`);
    }

    const counts = await Promise.all([
      User.countDocuments(),
      Category.countDocuments(),
      Product.countDocuments(),
    ]);

    console.log('\n═══════════════════════════════════');
    console.log('  SEED TERMINÉ AVEC SUCCÈS');
    console.log('═══════════════════════════════════');
    console.log(`  Utilisateurs : ${counts[0]}`);
    console.log(`  Catégories   : ${counts[1]}`);
    console.log(`  Produits     : ${counts[2]}`);
    console.log('───────────────────────────────────');
    console.log('  Admin    : admin@boutique.sn / admin123');
    console.log('  Client   : client@example.com / client123');
    console.log('═══════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
