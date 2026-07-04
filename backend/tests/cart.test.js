const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Cart = require('../src/models/Cart');

let userToken, userId, productId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-test');
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({}), Cart.deleteMany({})]);

  await User.create({ firstName: 'Client', lastName: 'Test', email: 'client@test.com', password: 'password123' });
  const login = await request(app).post('/api/v1/auth/login').send({ email: 'client@test.com', password: 'password123' });
  userToken = login.body.token;
  userId = login.body.user._id;

  const cat = await Category.create({ name: 'Cat', slug: 'cat' });
  const prod = await Product.create({ name: 'Article', slug: 'article', description: 'Desc', basePrice: 5000, stock: 10, category: cat._id });
  productId = prod._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Cart', () => {
  it('GET /api/v1/cart - panier vide par défaut', async () => {
    const res = await request(app).get('/api/v1/cart').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });

  it('POST /api/v1/cart/items - ajoute un article', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.totalQuantity).toBe(2);
  });

  it('POST /api/v1/cart/items - incrémente si existant', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 3 });
    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
  });

  it('PATCH /api/v1/cart/items/:itemId - met à jour quantité', async () => {
    const cart = await Cart.findOne({ user: userId });
    const itemId = cart.items[0]._id;
    const res = await request(app)
      .patch(`/api/v1/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 1 });
    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(1);
  });

  it('DELETE /api/v1/cart/items/:itemId - supprime article', async () => {
    const cart = await Cart.findOne({ user: userId });
    const itemId = cart.items[0]._id;
    const res = await request(app)
      .delete(`/api/v1/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(0);
  });
});
