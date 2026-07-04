const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');

let adminToken, categoryId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-test');
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({})]);

  await User.create({ firstName: 'Admin', lastName: 'Test', email: 'admin@test.com', password: 'password123', role: 'admin' });
  const login = await request(app).post('/api/v1/auth/login').send({ email: 'admin@test.com', password: 'password123' });
  adminToken = login.body.token;

  const cat = await Category.create({ name: 'TestCat', slug: 'testcat' });
  categoryId = cat._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Products', () => {
  let productId;

  it('POST /api/v1/products - crée un produit (admin)', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Produit Test')
      .field('slug', 'produit-test')
      .field('description', 'Description du produit')
      .field('basePrice', 10000)
      .field('category', categoryId.toString());
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Produit Test');
    productId = res.body._id;
  });

  it('POST /api/v1/products - rejet sans auth', async () => {
    const res = await request(app).post('/api/v1/products').send({ name: 'Test' });
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/products - liste publique', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/products/:slug - détail par slug', async () => {
    const res = await request(app).get('/api/v1/products/produit-test');
    expect(res.status).toBe(200);
    expect(res.body.basePrice).toBe(10000);
  });

  it('GET /api/v1/products - filtre par catégorie', async () => {
    const res = await request(app).get(`/api/v1/products?category=testcat`);
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('PATCH /api/v1/products/:id - modifie un produit (admin)', async () => {
    const res = await request(app)
      .patch(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ basePrice: 15000 });
    expect(res.status).toBe(200);
    expect(res.body.basePrice).toBe(15000);
  });

  it('DELETE /api/v1/products/:id - supprime un produit (admin)', async () => {
    const res = await request(app)
      .delete(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
