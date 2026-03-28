
// Handle renaming of table and fixing the player_id and game_d as foreign keys
exports.up = async function(knex) {
    await knex.schema.dropTableIfExists('player-stats');

    await knex.schema.createTable('player_stats', (table) => {
        table.increments('id').primary();

        table.integer('player_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('players')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');

        table.integer('game_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('games')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');

        table.decimal('hours_played', 8, 2)
            .defaultTo(0)
            .notNullable();

        table.date('date_purchased').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());

        table.unique(['player_id', 'game_id']);

        // Also add indexing for searching tables
        table.index(['game_id']);
    });
};

exports.down = function(knex) {
    
};
