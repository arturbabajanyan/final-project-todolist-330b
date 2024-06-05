const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server');
const User = require('../models/user');
const Category = require('../models/category');
require('dotenv').config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterAll(async () => {
  await User.deleteMany({});
  await Category.deleteMany({});
  await mongoose.connection.close();
});

describe('Categories Routes', () => {
  let token;

  beforeAll(async () => {
    const response = await request(server).post('/auth/signup').send({
      username: 'testuser',
      password: 'testpass',
    });
    token = response.body.token;
  });

  it('should create a new category', async () => {
    const response = await request(server)
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Category',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('name', 'Test Category');
  });

  it('should get all categories', async () => {
    const response = await request(server)
      .get('/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});
