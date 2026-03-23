
const PASSWORD = 'password'
const PASSWORD_HASH = 'password_hash'

exports.up = function(knex) {
    return knex.schema.alterTable('players', (table) => {
        table.renameColumn(PASSWORD, PASSWORD_HASH);
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('players', (table) => {
        table.renameColumn(PASSWORD_HASH, PASSWORD);
    });
};
