const knex = require("../connection.js");

async function all() {
    return knex('projects');
}

async function get(id) {
    const results = await knex('projects').where({ id });
    return results[0];
}

async function create(body) {
    const results = await knex('projects').insert(body).returning('*');
    return results[0];
}

async function update(id, properties) {
    const results = await knex('projects').where({ id }).update({ ...properties }).returning('*');
    return results[0];
}

// delete is a reserved keyword
async function del(id) {
    const results = await knex('projects').where({ id }).del().returning('*');
    return results[0];
}

async function clear() {
    return knex('projects').del().returning('*');
}

module.exports = {
    all,
    get,
    create,
    update,
    delete: del,
    clear
}