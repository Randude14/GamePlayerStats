exports.up = async function(knex) {
	await knex.schema.alterTable("player_stats", (table) => {
		table
			.decimal("rating", 3, 1) // allows ratings of 3.4 and 4.5 for exampe, but not those like 1.22
			.nullable();

		table
			.boolean("is_favorite")
			.notNullable()
			.defaultTo(false);
	});
};

exports.down = async function(knex) {
	await knex.schema.alterTable("player_stats", (table) => {
		table.dropColumn("rating");
		table.dropColumn("is_favorite");
	});
};