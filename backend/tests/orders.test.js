const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

let userToken, adminToken, productId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-test');
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({}), Order.deleteMany({})]);

  await User.create({ firstName: 'Client', lastName: 'Test', email: 'client@test.com', password: 'password123' });
  const login = await request(app).post('/api/v1/auth/login').send({ email: 'client@test.com', password: 'password123' });
  userToken = login.body.token;

  await User.create({ firstName: 'Admin', lastName: 'Test', email: 'admin@test.com', password: 'password123', role: 'admin' });
  const adminLogin = await request(app).post('/api/v1/auth/login').send({ email: 'admin@test.com', password: 'password123' });
  adminToken = adminLogin.body.token;

  const cat = await Category.create({ name: 'Cat', slug: 'cat' });
  const prod = await Product.create({ name: 'Article', slug: 'article', description: 'Desc', basePrice: 5000, stock: 10, category: cat._id });
  productId = prod._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Orders', () => {
  let orderId;

  it('POST /api/v1/orders - crée une commande', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ product: productId, name: 'Article', quantity: 2, price: 5000 }],
        shippingAddress: { street: '123 Rue', city: 'Dakar', country: 'Sénégal' },
        shippingMethod: 'standard',
      });
    expect(res.status).toBe(201);
    expect(res.body.items.length).toBe(1);
    expect(res.body.totalAmount).toBe(12000);
    orderId = res.body._id;
  });

  it('GET /api/v1/orders - liste commandes client', async () => {
    const res = await request(app).get('/api/v1/orders').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orders.length).toBe(1);
  });

  it('GET /api/v1/orders/:id - détail commande', async () => {
    const res = await request(app).get(`/api/v1/orders/${orderId}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orderNumber).toBeDefined();
  });

  it('GET /api/v1/orders/admin - admin voit toutes les commandes', async () => {
    const res = await request(app).get('/api/v1/orders/admin').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orders.length).toBe(1);
  });

  it('PATCH /api/v1/orders/:id/status - admin met à jour le statut', async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('confirmed');
  });
});
