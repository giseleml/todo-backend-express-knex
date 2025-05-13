const { todosFields } = require('../models/todos.js');
const { organizationsFields } = require('../models/organizations.js');

const TABLES = [todosFields, organizationsFields];

exports.up = function (knex) {
    return TABLES.map(table => {
        return knex.schema.hasTable(table.table_name)
            .then(exists => {
                if (exists) {
                    console.log(`[database] table ${table.table_name} already exists. Bailing out...`);
                    return null
                }

                return knex.schema.createTable(table.table_name, function (createdTable) {
                    createdTable.increments('id').primary();

                    table.fields.forEach(field => {
                        if (field.increments) {
                            return createdTable.increments(field.name, { primaryKey: false })
                        }

                        let column = createdTable[field.type](field.name)


                        if (field.notNull) {
                            column.notNullable();
                        }

                        if (field.defaultTo) {
                            column.defaultTo(field.defaultTo);
                        }

                        if (field.foreign) {
                            createdTable.foreign(field.name).references(field.references)
                        }

                        return column
                    });
                })
            })
            .catch(error => {
                console.log(`[database] error creating table ${table.table_name}:`, error);
            })
    })
};

exports.down = function (knex) {
    return TABLES.forEach(table => knex.schema.dropTable(table.table_name, () => {
        console.log(`[database] dropping table ${table.table_name}`);
        return null
    })
        .catch(error => {
            console.log(`[database] error dropping table ${table.table_name}:`, error);
        }))
};