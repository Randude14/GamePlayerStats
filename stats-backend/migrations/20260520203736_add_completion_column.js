exports.up = async function(knex) {
	await knex.schema.alterTable("player_stats", (table) => {
		table
			.string("completion_status", 50)
			.notNullable()
			.defaultTo("not_started");
	});
};

exports.down = async function(knex) {
	await knex.schema.alterTable("player_stats", (table) => {
		table.dropColumn("completion_status");
	});
};