const express = require('express');
const app = express();

const orgModel = require('../models/organizations.js');

app.post('/', orgModel.createOrganization);
app.get('/', orgModel.getAllOrganizations);
app.get('/:id', orgModel.getOrganization);
app.put('/:id', orgModel.updateOrganization);
app.delete('/:id', orgModel.deleteOrganization);

module.exports = app;