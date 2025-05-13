const express = require('express');
const app = express();

const todoModel = require('../models/todos.js');

app.get('/', todoModel.getAllTodos);
app.get('/:id', todoModel.getTodo);

app.post('/', todoModel.postTodo);
app.patch('/:id', todoModel.patchTodo);

app.delete('/', todoModel.deleteAllTodos);
app.delete('/:id', todoModel.deleteTodo);

module.exports = app;