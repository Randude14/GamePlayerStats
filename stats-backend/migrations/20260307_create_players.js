exports.up = function(knex) {
  // knex keeps a migrations table and will only run this file once per
  // migration state. the additional "hasTable" guard makes the SQL safe if
  // someone accidentally executes it directly or if the table already exists
  // for any reason.
  return knex.schema.hasTable('players').then(exists => {
    if (exists) return;
    return knex.schema.createTable('players', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.integer('score').defaultTo(0);
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('players');
};