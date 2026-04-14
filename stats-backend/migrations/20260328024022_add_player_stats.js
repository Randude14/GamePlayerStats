
exports.up = function(knex) {
    return knex.schema.hasTable('player-stats').then(exists => {
        if (exists) return;
        return knex.schema.createTable('player-stats', (table) => {
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
            table.decimal("hours_played").unsigned().defaultTo(0).notNullable();
            table.date("date_purchased").notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

            table.unique(['player_id', 'game_id']);
        });
    });

};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('player-stats');
};
