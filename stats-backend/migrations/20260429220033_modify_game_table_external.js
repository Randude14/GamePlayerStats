exports.up = async function(knex) {
	await knex.schema.alterTable("games", (table) => {
		table.dropUnique(["title", "release"]); // remove old constraint
        table.json('platforms').nullable();
        table.json('themes').nullable();
        table.json('genres').nullable();
        table.json('player_perspectives').nullable();
        table.json('game_modes').nullable();
        table.string('game_type').nullable();

		table.unique(["external_source", "external_id"]); // add new one
	});
};

exports.down = async function(knex) {
	await knex.schema.alterTable("games", (table) => {
		table.dropUnique(["external_source", "external_id"]);

		table.unique(["title", "release"]);
	});
};