const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server');
const User = require('../models/user');
const Todo = require('../models/todo');
const Category = require('../models/category');
require('dotenv').config();

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  const userResponse = await request(server).post('/auth/signup').send({
    username: 'testuser',
    password: 'testpass',
  });

  token = userResponse.body.token;
});

afterAll(async () => {
  await User.deleteMany({});
  await Todo.deleteMany({});
  await Category.deleteMany({});
  await mongoose.connection.close();
});

describe('Todos Routes', () => {
  it('should create a new todo', async () => {
    const response = await request(server)
      .post('/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Todo',
        description: 'Test Description',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.title).toBe('Test Todo');
  });

  it('should get all todos for the authenticated user', async () => {
    const response = await request(server)
      .get('/todos')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should update an existing todo', async () => {
    const todoResponse = await request(server)
      .post('/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Another Todo',
        description: 'Another Description',
      });

    const todoId = todoResponse.body._id;

    const response = await request(server)
      .patch(`/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Todo',
      });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Todo');
  });

  it('should delete an existing todo', async () => {
    const todoResponse = await request(server)
      .post('/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Todo to Delete',
      });

    const todoId = todoResponse.body._id;

    const response = await request(server)
      .delete(`/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  it('should search todos by text', async () => {
    const categoryId = new mongoose.Types.ObjectId();

    await request(server)
      .post('/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Todo 1',
        description: 'This is the first test todo',
        category: categoryId,
      });

    await request(server)
      .post('/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Todo 2',
        description: 'This is the second test todo',
        category: categoryId,
      });

    const response = await request(server)
      .get('/todos/search')
      .set('Authorization', `Bearer ${token}`)
      .query({ query: 'first' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('Test Todo 1');
  });

  it('should get summary of todos by completion status', async () => {
    const response = await request(server)
      .get('/todos/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ completed: false, count: expect.any(Number) })
    ]));
  });

  it('should get todos with their categories', async () => {
    const category = new Category({ name: 'Work' });
    await category.save();

    await request(server)
      .post('/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Todo with Category',
        description: 'This todo has a category',
        category: category._id,
      });

    const response = await request(server)
      .get('/todos/with-categories')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('categoryDetails.name', 'Work');
  });
});
