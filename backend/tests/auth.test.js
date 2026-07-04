const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-test');
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Auth', () => {
  const userData = { firstName: 'Test', lastName: 'User', email: 'test@test.com', password: 'password123' };
  let token;

  it('POST /api/v1/auth/register - crée un utilisateur', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(userData);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(userData.email);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('POST /api/v1/auth/register - rejet email existant', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(userData);
    expect(res.status).toBe(409);
  });

  it('POST /api/v1/auth/login - connexion valide', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: userData.email, password: userData.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/v1/auth/login - rejet mauvais mot de passe', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: userData.email, password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/auth/profile - accès protégé', async () => {
    const res = await request(app).get('/api/v1/auth/profile').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(userData.email);
  });

  it('GET /api/v1/auth/profile - rejet sans token', async () => {
    const res = await request(app).get('/api/v1/auth/profile');
    expect(res.status).toBe(401);
  });
});
