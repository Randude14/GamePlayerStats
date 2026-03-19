/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.hasTable("players").then(exists => {
        if (exists) {
            return knex.schema.alterTable("players", table => {
                table.string("password").unique().notNullable();
            });
        }
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.hasTable("players").then(exists => {
        if (exists) {
            return knex.schema.alterTable("players", table => {
                table.dropColumn("password");
            });
        }
    });
};
