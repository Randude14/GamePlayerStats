exports.up = async function(knex) {
    await knex.schema.alterTable("players", table => {
        table.string("email");
        table.string("username");
    });

    await knex("players").update({
        email: "johndoe@email.com",
        username: "johndoe"
    });

    await knex.schema.alterTable("players", table => {
        table.string("email").notNullable().alter();
        table.string("username").notNullable().alter();

        table.unique(["email"]);
        table.unique(["username"]);

        table.timestamps(true, true);
    });

    await knex.schema.alterTable("players", table => {
        table.dropColumn("score");
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable("players", table => {
        table.dropColumn("created_at");
        table.dropColumn("updated_at");
        table.dropColumn("username");
        table.dropColumn("email");

        table.integer("score");
    });
};