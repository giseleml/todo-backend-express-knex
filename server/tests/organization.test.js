/*
    Tests taken from the todo-backend spec located at:
    https://github.com/TodoBackend/todo-backend-js-spec/blob/master/js/specs.js
    
    And transcribed from Mocha/Chai to Jest with async/await/promises and other ES6+ features
    for ease of extension of this project (any additional testing).
*/
process.env.NODE_ENV = 'test';
const _ = require("lodash");
const url = require('url');
const request = require('./util/httpRequests.js');

// Relative paths are used for supertest in the util file.
const urlFromOrg = todo => {
  const newUrl = new URL(todo.url, `${request.root}/organizations`)
  return newUrl["pathname"]
};

const getRoot = _ => request.get('/organizations');
const getBody = response => response.body;

describe(`Todo-Backend API residing at http://localhost:${process.env.PORT}/organizations`, () => {
  it('should create an organization', async () => {
    const response = await request.post('/organizations', { name: 'Test Organization' });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Test Organization');
  });

  it('should get all organizations', async () => {
    const response = await request.get('/organizations');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should get an organization by id', async () => {
    const response = await request.get('/organizations/1');
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
  });

  it('should update an organization', async () => {
    const response = await request.put('/organizations/1', { name: 'Updated Organization' });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Organization');
  });

  it('should delete an organization', async () => {
    const response = await request.delete('/organizations/1');
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
    expect(response.body.state).toBe('inactive');
  });
})