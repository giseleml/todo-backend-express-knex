const { todosFields } = require('../models/todos.js');
const { organizationsFields } = require('../models/organizations.js');

const TABLES = [todosFields, organizationsFields];

exports.up = function (knex) {
    console.log('[database] Creating tables...')
    return Promise.all(TABLES.map(table => {
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
                return Promise.reject(error)
            })
    }))
        .then(() => {
            console.log('[database] Tables created successfully')
            return Promise.resolve({})
        })
};

exports.down = function (knex) {
    console.log('[database] Dropping tables...')
    return Promise.all(TABLES.map(table => knex.schema.dropTable(table.table_name, () => {
        console.log(`[database] dropping table ${table.table_name}`);
    })
        .catch(error => {
            console.log(`[database] error dropping table ${table.table_name}:`, error);
            return Promise.reject(error)
        }))
    )
        .then(() => {
            console.log('[database] Tables dropped successfully')
            return Promise.resolve({})
        })
};