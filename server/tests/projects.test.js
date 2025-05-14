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
const organizations = require('../database/queries/organizations.js');
// Relative paths are used for supertest in the util file.
const urlFromOrg = todo => {
  const newUrl = new URL(todo.url, `${request.root}/projects`)
  return newUrl["pathname"]
};

const getBody = response => response.body;

let organization = null

beforeEach(async () => {
  organization = await organizations.create({ name: 'Test Organization' });
});

describe(`Todo-Backend API residing at http://localhost:${process.env.PORT}/projects`, () => {
  function createFreshOrganizationAndGetItsUrl (params) {
    var postParams = _.defaults((params || {}), { name: "Mobile App", organization: organization.id });
    return request.post('/projects', postParams).then(getBody).then(urlFromOrg);
  };

  it('should create an organization', async () => {
    const response = await request.post('/projects', { name: 'Mobile App', organization: organization.id });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Mobile App');
  });

  it('should get an organization by id', async () => {
    const url = await createFreshOrganizationAndGetItsUrl();
    const orgId = url.split('/').pop();

    const response = await request.get(`/projects/${orgId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(orgId);
  });

  it('should update an organization', async () => {
    const url = await createFreshOrganizationAndGetItsUrl();
    const orgId = url.split('/').pop();

    const response = await request.put(`/projects/${orgId}`, { name: 'Updated Organization' });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Organization');
    expect(response.body.id).toBe(orgId);
  });

  it('should activate a project', async () => {
    const url = await createFreshOrganizationAndGetItsUrl();
    const orgId = url.split('/').pop();

    const response = await request.post(`/projects/${orgId}/activate`);
    expect(response.status).toBe(200);
    expect(response.body.state).toBe('active');
  });

  it('should deactivate a project', async () => {
    const url = await createFreshOrganizationAndGetItsUrl();
    const orgId = url.split('/').pop();

    const response = await request.post(`/projects/${orgId}/deactivate`);
    expect(response.status).toBe(200);
    expect(response.body.state).toBe('inactive');
  });

  it('should return error when trying to deactivate a project that is not found', async () => {
    const response = await request.post(`/projects/550e8400-e29b-41d4-a716-446655440000/deactivate`);
    expect(response.status).toBe(404);
  });

  it('should return error when trying to activate a project that is not found', async () => {
    const response = await request.post(`/projects/550e8400-e29b-41d4-a716-446655440000/activate`);
    expect(response.status).toBe(404);
  });
  
})