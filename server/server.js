const knex = require('./database/connection.js');
const app = require('./server-config.js');
const todoRoutes = require('./routes/todos.js');
const organizationRoutes = require('./routes/organizations.js');
const { up, down } = require('./database/migrations');

const port = process.env.PORT || 5000;

app.use('/todos', todoRoutes);
app.use('/organizations', organizationRoutes);

if (process.env.NODE_ENV !== 'test') {
  up(knex)
    .then(() => app.listen(port, () => console.log(`Listening on port ${port}`)));
}

module.exports = app;