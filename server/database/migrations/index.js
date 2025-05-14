const { todosFields } = require('../../models/todos.js');
const { organizationsFields } = require('../../models/organizations.js');
const { projectsFields } = require('../../models/projects.js');

const TABLES = [todosFields, organizationsFields, projectsFields];

exports.up = function (knex) {
  console.log('[database] Creating tables...');

  return Promise.all([
    knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'),
    ...TABLES.map(table => {
      return knex.schema
        .hasTable(table.table_name)
        .then(exists => {
          if (exists) {
            console.log(`[database] Table ${table.table_name} already exists. Bailing out...`);
            return null;
          }

          return knex.schema.createTable(table.table_name, function (createdTable) {
            createdTable.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

            table.fields.forEach(field => {
              if (field.increments) {
                createdTable.increments(field.name, { primaryKey: false });
              } else {
                let column = createdTable[field.type](field.name);

                if (field.notNull) {
                  column.notNullable();
                }

                if (field.defaultTo) {
                  column.defaultTo(field.defaultTo);
                }

                if (field.foreign) {
                  createdTable.foreign(field.name).references(field.references);
                }

                return column;
              }
            });
          })
            .then(() => {
              console.log(`[database] Table ${table.table_name} created successfully.`);
            });
        })
        .catch(error => {
          console.log(`[database] Error creating table ${table.table_name}:`, error);
          return Promise.reject(error);
        });
    })
  ])
    .then(() => {
      console.log('[database] All tables created successfully');
      return Promise.resolve({});
    })
    .catch(error => {
      console.log('[database] Error during table creation:', error);
      return Promise.reject(error);
    });
};

exports.down = function (knex) {
  console.log('[database] Dropping tables...');

  return Promise.all(
    TABLES.map(table =>
      knex.schema
        .hasTable(table.table_name)
        .then(exists => {
          if (!exists) {
            return null;
          }

          return knex.schema
            .dropTable(table.table_name)
            .then(() => {
              console.log(`[database] Dropped table ${table.table_name}`);
            })
            .catch(error => {
              console.log(`[database] Error dropping table ${table.table_name}:`, error);
              return Promise.reject(error);
            });
        })
    )
  )
    .then(() => {
      console.log('[database] Tables dropped successfully');
      return Promise.resolve({});
    })
    .catch(error => {
      console.log('[database] Error during drop process:', error);
      return Promise.reject(error);
    });
};
