exports.up = function(knex) {
    return knex.schema.hasTable('games').then(exists => {
        if (exists) return;
        return knex.schema.createTable('games', (table) => {
            table.increments('id').primary();
            table.string('title', 255).notNullable();
            table.string('developer').notNullable();
            table.string('publisher').notNullable();
            table.date('release').notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

            table.unique(['title', 'release']);
        });
    });
};


exports.down = function(knex) {
    return knex.schema.dropTableIfExists('games');
};
