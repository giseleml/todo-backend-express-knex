const _ = require('lodash');
const todos = require('../database/queries/todos.js');
const addErrorReporting = require('../middlewares/error_handler.js');
const organizations = require('../database/queries/organizations.js');
const projects = require('../database/queries/projects.js');

function view (req, data) {
  const protocol = req.protocol,
    host = req.get('host'),
    id = data.id;

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    code: data.code,
    project: data.project,
    status: data.status,
    organization: data.organization,
    url: `${protocol}://${host}/todos/${id}`
  };
}

async function getTodosByProjectId (req, res) {
  const allEntries = await todos.getByProjectId(req.params.projectId);

  if (allEntries.length === 0) {
    throw new Error('Todos not found');
  }

  return res.send(allEntries.map(_.curry(view)(req)));
}

async function getAllTodos (req, res) {
  const allEntries = await todos.all();

  if (allEntries.length === 0) {
    throw new Error('Todos not found');
  }

  return res.send(allEntries.map(_.curry(view)(req)));
}

async function getTodo (req, res) {
  const todo = await todos.get(req.params.id);

  if (!todo) {
    throw new Error('Todo not found');
  }

  return res.send(view(req, todo));
}

async function postTodo (req, res) {
  const organization = await organizations.get(req.body.organization);

  if (!organization) {
    throw new Error('Organization not found');
  }

  const project = await projects.get(req.body.project);

  if (!project) {
    throw new Error('Project not found');
  }

  const created = await todos.create({
    title: req.body.title,
    description: req.body.description,
    code: req.body.code,
    status: req.body.status,
    organization: req.body.organization,
    project: req.body.project
  });

  if (!created) {
    throw new Error('Todo not created');
  }

  return res.send(view(req, created));
}

async function patchTodo (req, res) {
  const patched = await todos.update(req.params.id, req.body);

  if (!patched) {
    throw new Error('Todo not updated');
  }

  return res.send(view(req, patched));
}

async function deleteAllTodos (req, res) {
  const deletedEntries = await todos.clear();

  if (deletedEntries.length === 0) {
    throw new Error('Todos not deleted');
  }

  return res.send(deletedEntries.map(_.curry(view)(req)));
}

async function deleteTodo (req, res) {
  const deleted = await todos.update(req.params.id, { status: 'deleted' });

  if (!deleted) {
    throw new Error('Todo not deleted');
  }

  return res.send(view(req, deleted));
}

const toExport = {
  getTodosByProjectId: { method: getTodosByProjectId, errorMessage: "Could not fetch todos by project id" },
  getAllTodos: { method: getAllTodos, errorMessage: "Could not fetch all todos" },
  getTodo: { method: getTodo, errorMessage: "Could not fetch todo" },
  postTodo: { method: postTodo, errorMessage: "Could not post todo" },
  patchTodo: { method: patchTodo, errorMessage: "Could not patch todo" },
  deleteAllTodos: { method: deleteAllTodos, errorMessage: "Could not delete all todos" },
  deleteTodo: { method: deleteTodo, errorMessage: "Could not delete todo" }
}

const todosFields = {
  table_name: 'todos',
  fields: [{
    name: 'title',
    type: 'string',
    notNull: true
  }, {
    name: 'code',
    type: 'integer',
    increments: true,
    notNull: true
  }, {
    name: 'status',
    type: 'string',
    notNull: true,
    defaultTo: 'created'
  }, {
    name: 'description',
    type: 'string',
  }, {
    name: 'organization',
    type: 'string',
    foreign: 'organizations',
    references: 'id',
    notNull: true
  }, {
    name: 'project',
    type: 'string',
    foreign: 'projects',
    references: 'id',
    notNull: true
  }]
}

for (let route in toExport) {
  toExport[route] = addErrorReporting(toExport[route].method, toExport[route].errorMessage);
}

module.exports = { ...toExport, todosFields };
