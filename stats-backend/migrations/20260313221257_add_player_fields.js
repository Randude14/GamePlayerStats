
exports.up = function(knex) {
    return knex.schema.hasTable("players").then(exists => {
        if (exists) {
            return knex.schema.alterTable("players", table => {
                table.dropColumn("score");
                table.string("email").defaultTo("johndoe@gmail.com").unique().notNullable();
                table.string("username").defaultTo("johndoe").unique().notNullable();
                table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
            });
        }
    });
};

exports.down = function(knex) {
    return knex.schema.hasTable("players").then(exists => {
        if (exists) {
            return knex.schema.alterTable("players", table => {
                table.dropColumn("created_at");
                table.dropColumn("username");
                table.dropColumn("email");
            });
        }
    });
};
