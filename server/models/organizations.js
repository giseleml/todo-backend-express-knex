const _ = require('lodash');
const organizations = require('../database/queries/organizations.js');
const addErrorReporting = require('../middlewares/error_handler.js');

function view(req, data) {
  const protocol = req.protocol, 
    host = req.get('host'), 
    id = data.id;

  return {
    name: data.name,
    state: data.state,
    id: data.id,
    url: `${protocol}://${host}/${id}`
  };
}

async function getAllOrganizations(req, res) {
  const allEntries = await organizations.all();
  return res.send(allEntries.map( _.curry(view)(req) ));
}

async function getOrganization(req, res) {
  const org = await organizations.get(req.params.id);
  return res.send(org);
}

async function postOrganization(req, res) {
  const created = await organizations.create({ name: req.body.name, state: 'active' });
  return res.send(view(req, created));
}

async function updateOrganization(req, res) {
  const patched = await organizations.update(req.params.id, req.body);
  return res.send(view(req, patched));
}

async function deleteOrganization(req, res) {
  const deleted = await organizations.update(req.params.id, { state: 'inactive' });
  return res.send(view(req, deleted));
}

const toExport = {
  getAllOrganizations: { method: getAllOrganizations, errorMessage: "Could not fetch organizations" },
  getOrganization: { method: getOrganization, errorMessage: "Could not fetch organization" },
  createOrganization: { method: postOrganization, errorMessage: "Could not post organization" },
  updateOrganization: { method: updateOrganization, errorMessage: "Could not update organization" },
  deleteOrganization: { method: deleteOrganization, errorMessage: "Could not delete organization" }
}

const organizationsFields = {
  table_name: 'organizations',
  fields: [{
    name: 'name',
    type: 'string',
    notNull: true
  }, {
    name: 'state',
    type: 'string',
    notNull: true,
    defaultTo: 'active'
  }]
}

for (let route in toExport) {
    toExport[route] = addErrorReporting(toExport[route].method, toExport[route].errorMessage);
}

module.exports = { ...toExport, organizationsFields };
