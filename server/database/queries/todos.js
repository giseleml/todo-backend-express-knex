const knex = require("../connection.js");

async function all () {
    return knex('todos');
}

async function get (id) {
    const results = await knex('todos').where({ id });
    return results[0];
}

async function create ({ title, code, status, description, organization }) {
    const results = await knex('todos').insert({ title, code, status, description, organization }).returning('*');
    return results[0];
}

async function update (id, properties) {
    const results = await knex('todos').where({ id }).update({ ...properties }).returning('*');
    return results[0];
}

// delete is a reserved keyword
async function del (id) {
    const results = await knex('todos').where({ id }).del().returning('*');
    return results[0];
}

async function clear () {
    return knex('todos').del().returning('*');
}

module.exports = {
    all,
    get,
    create,
    update,
    delete: del,
    clear
}