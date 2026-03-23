exports.up = async function(knex) {
    await knex.schema.alterTable("players", table => {
        table.string("password").notNullable()
    });

    // backfill with placeholder hashed pw
    await knex("players").update({
        password: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36v5ZkQe6pH9d0kF5sQ1G6W"
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable("players", table => {
        table.dropColumn("password");
    });
};
