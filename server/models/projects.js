const _ = require('lodash');
const projects = require('../database/queries/projects.js');
const addErrorReporting = require('../middlewares/error_handler.js');
const organizations = require('../database/queries/organizations.js');
function view (req, data) {
  const protocol = req.protocol,
    host = req.get('host'),
    id = data.id;

  return {
    name: data.name,
    state: data.state,
    organization: data.organization,
    id: data.id,
    url: `${protocol}://${host}/${id}`
  };
}


async function getProject (req, res) {
  const project = await projects.get(req.params.id);

  if (!project) {
    throw new Error('Project not found');
  }

  return res.send(view(req, project));
}

async function postProject (req, res) {
  const organization = await organizations.get(req.body.organization);

  if (!organization) {
    throw new Error('Organization not found');
  }

  const created = await projects.create({ name: req.body.name, organization: req.body.organization, state: 'active' });

  if (!created) {
    throw new Error('Project not found');
  }

  return res.send(view(req, created));
}

async function updateProject (req, res) {
  const patched = await projects.update(req.params.id, req.body);

  if (!patched) {
    throw new Error('Project not found');
  }

  return res.send(view(req, patched));
}

async function deleteProject (req, res) {
  const deleted = await projects.update(req.params.id, { state: 'inactive' });

  if (!deleted) {
    throw new Error('Project not found');
  }

  return res.send(view(req, deleted));
}

async function activateProject (req, res) {
  const activated = await projects.update(req.params.id, { state: 'active' });

  if (!activated) {
    throw new Error('Project not found');
  }

  return res.send(view(req, activated));
}

async function deactivateProject (req, res) {
  const deactivated = await projects.update(req.params.id, { state: 'inactive' });

  if (!deactivated) {
    throw new Error('Project not found');
  }

  return res.send(view(req, deactivated));
}

const toExport = {
  getProject: { method: getProject, errorMessage: "Could not fetch projects" },
  createProject: { method: postProject, errorMessage: "Could not post projects" },
  updateProject: { method: updateProject, errorMessage: "Could not update projects" },
  deleteProject: { method: deleteProject, errorMessage: "Could not delete projects" },
  activateProject: { method: activateProject, errorMessage: "Could not activate projects" },
  deactivateProject: { method: deactivateProject, errorMessage: "Could not deactivate projects" }
}

const projectsFields = {
  table_name: 'projects',
  fields: [{
    name: 'name',
    type: 'string',
    notNull: true
  }, {
    name: 'organization',
    type: 'string',
    foreign: 'organizations',
    references: 'id',
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

module.exports = { ...toExport, projectsFields };
