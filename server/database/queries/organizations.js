const knex = require("../connection.js");

async function all() {
    return knex('organizations');
}

async function get(id) {
    const results = await knex('organizations').where({ id });
    return results[0];
}

async function create(body) {
    const results = await knex('organizations').insert(body).returning('*');
    return results[0];
}

async function update(id, properties) {
    const results = await knex('organizations').where({ id }).update({ ...properties }).returning('*');
    return results[0];
}

// delete is a reserved keyword
async function del(id) {
    const results = await knex('organizations').where({ id }).del().returning('*');
    return results[0];
}

async function clear() {
    return knex('organizations').del().returning('*');
}

module.exports = {
    all,
    get,
    create,
    update,
    delete: del,
    clear
}