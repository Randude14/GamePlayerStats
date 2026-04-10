exports.up = async function (knex) {
    // 1. Add new columns first. Keep them nullable initially or give safe defaults.
    await knex.schema.alterTable('games', (table) => {
        table.integer('external_id').nullable();
        table.string('external_source').nullable();
        table.string('cover_url').nullable();
        table.json('developers').notNullable().defaultTo(JSON.stringify([]));
        table.json('publishers').notNullable().defaultTo(JSON.stringify([]));
    });

    // 2. Copy old single-value columns into new JSON array columns.
    const games = await knex('games').select('id', 'developer', 'publisher');

    for (const game of games) {
        await knex('games')
            .where({ id: game.id })
            .update({
                developers: JSON.stringify(game.developer ? [game.developer] : []),
                publishers: JSON.stringify(game.publisher ? [game.publisher] : []),
                external_id: null,
                external_source: null,
                cover_url: null
            });
    }

    // 3. Remove old columns after data is migrated.
    await knex.schema.alterTable('games', (table) => {
        table.dropColumn('developer');
        table.dropColumn('publisher');
    });
};

exports.down = async function (knex) {
    // 1. Recreate old columns first.
    await knex.schema.alterTable('games', (table) => {
        table.string('developer').notNullable().defaultTo('');
        table.string('publisher').notNullable().defaultTo('');
    });

    // 2. Read JSON columns and move first value back into old string columns.
    const games = await knex('games').select('id', 'developers', 'publishers');

    for (const game of games) {
        let developers = [];
        let publishers = [];

        try {
            developers = Array.isArray(game.developers)
                ? game.developers
                : JSON.parse(game.developers || '[]');
        } catch (err) {
            developers = [];
        }

        try {
            publishers = Array.isArray(game.publishers)
                ? game.publishers
                : JSON.parse(game.publishers || '[]');
        } catch (err) {
            publishers = [];
        }

        await knex('games')
            .where({ id: game.id })
            .update({
                developer: developers[0] || '',
                publisher: publishers[0] || ''
            });
    }

    // 3. Drop the new columns after data is restored.
    await knex.schema.alterTable('games', (table) => {
        table.dropColumn('external_id');
        table.dropColumn('external_source');
        table.dropColumn('cover_url');
        table.dropColumn('developers');
        table.dropColumn('publishers');
    });
};