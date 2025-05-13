const _ = require('lodash');
const todos = require('../database/queries/todos.js');
const addErrorReporting = require('../middlewares/error_handler.js');

function createToDo(req, data) {
  const protocol = req.protocol, 
    host = req.get('host'), 
    id = data.id;

  return {
    title: data.title,
    description: data.description,
    code: data.code,
    status: data.status,
    organization: data.organization,
    url: `${protocol}://${host}/${id}`
  };
}

async function getAllTodos(req, res) {
  const allEntries = await todos.all();
  return res.send(allEntries.map( _.curry(createToDo)(req) ));
}

async function getTodo(req, res) {
  const todo = await todos.get(req.params.id);
  return res.send(todo);
}

async function postTodo(req, res) {
  const created = await todos.create({
    title: req.body.title, 
    description: req.body.description, 
    code: req.body.code, 
    status: req.body.status, 
    organization: req.body.organization
  });
  return res.send(createToDo(req, created));
}

async function patchTodo(req, res) {
  const patched = await todos.update(req.params.id, req.body);
  return res.send(createToDo(req, patched));
}

async function deleteAllTodos(req, res) {
  const deletedEntries = await todos.clear();
  return res.send(deletedEntries.map( _.curry(createToDo)(req) ));
}

async function deleteTodo(req, res) {
  const deleted = await todos.delete(req.params.id);
  return res.send(createToDo(req, deleted));
}

const toExport = {
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
    defaultTo: 'active'
  }, {
    name: 'description',
    type: 'string',
    notNull: true
  }, {
    name: 'organization',
    type: 'integer',
    foreign: 'organizations',
    references: 'id',
    notNull: true
  }]
}

for (let route in toExport) {
    toExport[route] = addErrorReporting(toExport[route].method, toExport[route].errorMessage);
}

module.exports = { ...toExport, todosFields };
