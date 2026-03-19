
exports.up = function(knex) {
    return knex.schema.alterTable("players", table => {
        table.dropColumn("score");
        table.string("email").unique().notNullable();
        table.string("username").unique().notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable("players", table => {
        table.dropColumn("created_at");
        table.dropColumn("username");
        table.dropColumn("email");
        table.integer("score");
    });
};
