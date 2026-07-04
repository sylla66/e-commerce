const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

const categories = [
  { name: 'Électronique', slug: 'electronique', description: 'Smartphones, ordinateurs, accessoires', attributes: [
    { name: 'marque', label: 'Marque', type: 'text', required: true },
    { name: 'couleur', label: 'Couleur', type: 'text' },
    { name: 'poids', label: 'Poids (g)', type: 'number', unit: 'g' },
  ]},
  { name: 'Mode', slug: 'mode', description: 'Vêtements, chaussures, accessoires', attributes: [
    { name: 'taille', label: 'Taille', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { name: 'couleur', label: 'Couleur', type: 'color' },
    { name: 'matiere', label: 'Matière', type: 'text' },
  ]},
  { name: 'Alimentation', slug: 'alimentation', description: 'Produits alimentaires, épicerie', attributes: [
    { name: 'poids', label: 'Poids (g)', type: 'number', unit: 'g' },
    { name: 'ingredients', label: 'Ingrédients', type: 'text' },
  ]},
  { name: 'Maison', slug: 'maison', description: 'Décoration, mobilier, ustensiles', attributes: [
    { name: 'matiere', label: 'Matière', type: 'text' },
    { name: 'hauteur', label: 'Hauteur (cm)', type: 'number', unit: 'cm' },
  ]},
];

const demoProducts = [
  { name: 'Smartphone Pro Max', slug: 'smartphone-pro-max', description: 'Dernier modèle avec écran OLED 6.7", 256Go stockage', basePrice: 450000, comparePrice: 550000, stock: 15, sku: 'SPM-001', categorySlug: 'electronique', attributes: { marque: 'TechPro', couleur: 'Noir', poids: '210' } },
  { name: 'Casque Bluetooth Premium', slug: 'casque-bluetooth-premium', description: 'Casque sans fil avec réduction de bruit active', basePrice: 85000, comparePrice: 120000, stock: 30, sku: 'CBT-001', categorySlug: 'electronique', attributes: { marque: 'SoundMax', couleur: 'Blanc', poids: '250' } },
  { name: 'Montre Connectée Sport', slug: 'montre-connectee-sport', description: 'Montre fitness avec GPS intégré et batterie 7 jours', basePrice: 125000, stock: 20, sku: 'MCS-001', categorySlug: 'electronique', attributes: { marque: 'FitTech', couleur: 'Noir', poids: '45' } },
  { name: 'T-shirt Coton Bio', slug: 'tshirt-coton-bio', description: 'T-shirt en coton biologique certifié, coupe confortable', basePrice: 12000, stock: 50, sku: 'TCB-001', categorySlug: 'mode', attributes: { taille: 'M', couleur: '#ffffff', matiere: 'Coton biologique' } },
  { name: 'Jean Slim Noir', slug: 'jean-slim-noir', description: 'Jean slim fit en denim stretch, noir profond', basePrice: 25000, comparePrice: 35000, stock: 35, sku: 'JSN-001', categorySlug: 'mode', attributes: { taille: 'L', couleur: '#1a1a1a', matiere: 'Denim stretch' } },
  { name: 'Robe d\'Été Fleurie', slug: 'robe-ete-fleurie', description: 'Robe légère imprimé floral, parfaite pour l\'été', basePrice: 22000, stock: 25, sku: 'REF-001', categorySlug: 'mode', attributes: { taille: 'S', couleur: '#ff6b9d', matiere: 'Viscose' } },
  { name: 'Chaussures Running Pro', slug: 'chaussures-running-pro', description: 'Chaussures de running avec amorti réactif', basePrice: 65000, comparePrice: 85000, stock: 18, sku: 'CRP-001', categorySlug: 'mode', attributes: { taille: '42', couleur: '#2563eb', matiere: 'Mesh respirant' } },
  { name: 'Huile d\'Olive Extra Vierge 1L', slug: 'huile-olive-extra-vierge', description: 'Huile d\'olive extra vierge première pression à froid', basePrice: 8000, stock: 100, sku: 'HOE-001', categorySlug: 'alimentation', attributes: { poids: '1000', ingredients: 'Olives vertes et noires' } },
  { name: 'Miel Pur Naturel 500g', slug: 'miel-pur-naturel', description: 'Miel 100% pur, récolté au Sénégal', basePrice: 5000, stock: 80, sku: 'MPN-001', categorySlug: 'alimentation', attributes: { poids: '500', ingredients: 'Miel pur' } },
  { name: 'Thé Vert Menthe', slug: 'the-vert-menthe', description: 'Thé vert premium à la menthe fraîche, lot de 100 sachets', basePrice: 3500, stock: 200, sku: 'TVM-001', categorySlug: 'alimentation', attributes: { poids: '200', ingredients: 'Thé vert, menthe' } },
  { name: 'Vase Céramique Artisanal', slug: 'vase-ceramique-artisanal', description: 'Vase fait main en céramique, décoration intérieure', basePrice: 18000, stock: 10, sku: 'VCA-001', categorySlug: 'maison', attributes: { matiere: 'Céramique', hauteur: '25' } },
  { name: 'Lampe d\'Ambiance LED', slug: 'lampe-ambiance-led', description: 'Lampe LED design avec variateur d\'intensité et télécommande', basePrice: 15000, stock: 22, sku: 'LAL-001', categorySlug: 'maison', attributes: { matiere: 'Aluminium + verre', hauteur: '35' } },
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
    });
    console.log(`Admin created: ${admin.email}`);

    const customer = await User.create({
      email: 'client@example.com',
      password: 'client123',
      firstName: 'Moussa',
      lastName: 'Diop',
      role: 'customer',
      phone: '+221 78 123 45 67',
    });
    console.log(`Customer created: ${customer.email}`);

    const createdCategories = {};
    for (const catData of categories) {
      const cat = await Category.create(catData);
      createdCategories[cat.slug] = cat._id;
      console.log(`Category created: ${cat.name}`);
    }

    for (const prodData of demoProducts) {
      const { categorySlug, ...rest } = prodData;
      await Product.create({
        ...rest,
        category: createdCategories[categorySlug],
        images: [`https://placehold.co/600x600/e2e8f0/64748b?text=${encodeURIComponent(rest.name.slice(0, 20))}`],
        tags: [categorySlug, ...rest.name.toLowerCase().split(' ')],
        searchText: `${rest.name} ${rest.description}`,
      });
      console.log(`Product created: ${rest.name}`);
    }

    console.log('\nSeed completed successfully!');
    console.log('Admin credentials: admin@boutique.sn / admin123');
    console.log('Customer credentials: client@example.com / client123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
