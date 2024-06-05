const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server');
const User = require('../models/user');
require('dotenv').config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Auth Routes', () => {
  it(
    'should sign up a new user',
    async () => {
      const response = await request(server).post('/auth/signup').send({
        username: 'testuser',
        password: 'testpass',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    },
    20000 // 20 seconds timeout
  );

  it(
    'should log in an existing user',
    async () => {
      const response = await request(server).post('/auth/login').send({
        username: 'testuser',
        password: 'testpass',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    },
    20000 // 20 seconds timeout
  );
});

