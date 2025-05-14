const express = require('express');
const app = express();

const projectModel = require('../models/projects.js');

app.post('/', projectModel.createProject);
app.post('/:id/activate', projectModel.activateProject);
app.post('/:id/deactivate', projectModel.deactivateProject);
app.get('/:id', projectModel.getProject);
app.put('/:id', projectModel.updateProject);

module.exports = app;