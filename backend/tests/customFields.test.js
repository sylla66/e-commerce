const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const CustomField = require('../src/models/CustomField');
const Order = require('../src/models/Order');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');

let adminToken, managerToken, userToken, orderId, productId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-test');
  await Promise.all([
    User.deleteMany({}),
    CustomField.deleteMany({}),
    Order.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
  ]);

  await User.create({ firstName: 'Admin', lastName: 'Test', email: 'admin@test.com', password: 'password123', role: 'admin' });
  const adminLogin = await request(app).post('/api/v1/auth/login').send({ email: 'admin@test.com', password: 'password123' });
  adminToken = adminLogin.body.token;

  await User.create({ firstName: 'Manager', lastName: 'Test', email: 'manager@test.com', password: 'password123', role: 'manager' });
  const mgrLogin = await request(app).post('/api/v1/auth/login').send({ email: 'manager@test.com', password: 'password123' });
  managerToken = mgrLogin.body.token;

  await User.create({ firstName: 'Client', lastName: 'Test', email: 'client@test.com', password: 'password123' });
  const userLogin = await request(app).post('/api/v1/auth/login').send({ email: 'client@test.com', password: 'password123' });
  userToken = userLogin.body.token;

  const cat = await Category.create({ name: 'Cat', slug: 'cat' });
  const prod = await Product.create({ name: 'Article', slug: 'article', description: 'Desc', basePrice: 5000, stock: 10, category: cat._id });
  productId = prod._id;

  const orderRes = await request(app)
    .post('/api/v1/orders')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      items: [{ product: productId, name: 'Article', quantity: 2, price: 5000 }],
      shippingAddress: { street: '123 Rue', city: 'Dakar', country: 'Sénégal' },
      shippingMethod: 'standard',
    });
  orderId = orderRes.body._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Custom Fields (admin config)', () => {
  let fieldId;

  it('POST /api/v1/admin/custom-fields - admin crée un champ texte', async () => {
    const res = await request(app)
      .post('/api/v1/admin/custom-fields')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'remise', label: 'Remise spéciale', type: 'number', defaultValue: 0 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('remise');
    fieldId = res.body._id;
  });

  it('POST /api/v1/admin/custom-fields - admin crée une taxe en %', async () => {
    const res = await request(app)
      .post('/api/v1/admin/custom-fields')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'tva', label: 'TVA 18%', type: 'percentage', defaultValue: 0 });
    expect(res.status).toBe(201);
  });

  it('GET /api/v1/admin/custom-fields - liste tous les champs', async () => {
    const res = await request(app)
      .get('/api/v1/admin/custom-fields')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('PATCH /api/v1/admin/custom-fields/:id - admin modifie un champ', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/custom-fields/${fieldId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ label: 'Remise exceptionnelle' });
    expect(res.status).toBe(200);
    expect(res.body.label).toBe('Remise exceptionnelle');
  });

  it('DELETE /api/v1/admin/custom-fields/:id - admin supprime un champ', async () => {
    const res = await request(app)
      .delete(`/api/v1/admin/custom-fields/${fieldId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/v1/admin/custom-fields - manager non autorisé', async () => {
    const res = await request(app)
      .get('/api/v1/admin/custom-fields')
      .set('Authorization', `Bearer ${managerToken}`);
    expect(res.status).toBe(403);
  });
});

describe('Custom Fields on Orders (manager)', () => {
  let tvaFieldId;

  beforeAll(async () => {
    let tva = await CustomField.findOne({ name: 'tva' });
    if (!tva) {
      tva = await CustomField.create({ name: 'tva', label: 'TVA 18%', type: 'percentage' });
    }
    tvaFieldId = tva._id;
  });

  it('GET /api/v1/orders/custom-fields/active - manager liste les champs actifs', async () => {
    const res = await request(app)
      .get('/api/v1/orders/custom-fields/active')
      .set('Authorization', `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('PATCH /api/v1/orders/:id/custom-fields - manager applique une taxe %', async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/${orderId}/custom-fields`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ customFields: [{ field: tvaFieldId.toString(), value: 18 }] });
    expect(res.status).toBe(200);
    expect(res.body.totalSurcharges).toBe(1800);
    expect(res.body.totalAmount).toBe(13800);
    const match = res.body.customFields.find((cf) => cf.label === 'TVA 18%');
    expect(match).toBeDefined();
    expect(match.amount).toBe(1800);
  });
});

describe('Invoice download', () => {
  it('GET /api/v1/orders/:id/invoice - client télécharge sa facture', async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${orderId}/invoice`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('facture');
  });

  it('GET /api/v1/orders/:id/invoice - admin télécharge', async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${orderId}/invoice`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
  });

  it('GET /api/v1/orders/:id/invoice - autre client non autorisé', async () => {
    await User.create({ firstName: 'Other', lastName: 'User', email: 'other@test.com', password: 'password123' });
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'other@test.com', password: 'password123' });
    const res = await request(app)
      .get(`/api/v1/orders/${orderId}/invoice`)
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(403);
  });
});
