const AppError = require('../util/AppError');
const extractExistingData = require('../util/extractExistingData');
const {Table} = require('../util/tables');

class PlayerStatService {

    constructor(_knex) {
        this.knex = _knex;
    }

    async getAllStats() {
        const stats = await this.knex(`${Table.PLAYER_STAT_TABLE} as ps`)
        .join(`${Table.GAME_TABLE} as g`, 'ps.game_id', 'g.id')
        .join(`${Table.PLAYER_TABLE} as p`, 'ps.player_id', 'p.id')
        .select(
            'ps.player_id',
            'ps.game_id',
            'ps.hours_played',
            'ps.date_purchased',
            'p.username',
            'g.title',
            'g.release'
        )
        return stats;
    }

    async getAllStatsFor(player_id) {
        // use join table to extract game info as well as the players stats for those games
        const stats = await this.knex(`${Table.PLAYER_STAT_TABLE} as ps`)
        .join(`${Table.GAME_TABLE} as g`, 'ps.game_id', 'g.id')
        .select(
            'ps.player_id',
            'ps.game_id',
            'ps.hours_played',
            'ps.date_purchased',
            'g.title',
            'g.release'
        )
        .where('ps.player_id', player_id);

        return stats;
    }

    async getById(id) {
        const stat = await this.knex(Table.PLAYER_STAT_TABLE).where({ id }).first();

        if(!stat) {
            throw new AppError('Player stat not found with id ' + id, 404);
        }

        return stat;
    }

    async getByPlayerAndGame(player_id, game_id) {
        if(!player_id || !game_id) {
            throw new AppError('Player id and/or game id not provided.', 400);
        }

        const stat = await this.knex(Table.PLAYER_STAT_TABLE).where({ player_id, game_id }).first();

        if(!stat) {
            throw new AppError(`Could not find game for ${player_id} and ${game_id}`, 404);
        }

        return stat;
    }

    async createPlayerStat(player_id, data) {
        const {game_id, hours_played, date_purchased} = data;

        const playerStatCheck = await this.knex(Table.PLAYER_STAT_TABLE)
                                .where({
                                    player_id,
                                    game_id
                                }).first();

        if(playerStatCheck) {
            throw new AppError('A player stat already exists.', 409);
        }

        const playerStat = await this.knex(Table.PLAYER_STAT_TABLE).insert({
            player_id,
            game_id,
            hours_played, 
            date_purchased,
            created_at: this.knex.fn.now()
        });

        return playerStat;
    }

    async updatePlayerStat(id, data) {
        const existingStat = await this.knex(Table.PLAYER_STAT_TABLE).where({ id }).first();

        if(!existingStat) {
            throw new AppError('Player stat does not exist.', 404);
        }

        // Only update existing fields
        const dataToUpdate = extractExistingData(['hours_played', 'date_purchased'], data);

        const stat = await this.knex(Table.PLAYER_STAT_TABLE)
            .where({ id })
            .update(dataToUpdate);
        return stat;
    }

    async deletePlayerStat(id) {
        const playerStatCheck = await this.knex(Table.PLAYER_STAT_TABLE)
                                        .where({ id }).first();

        if(! playerStatCheck) {
            throw new AppError('Player stat does not exist.', 404);
        }

        await this.knex(Table.PLAYER_STAT_TABLE).where({ id }).delete();
        return playerStatCheck;
    }

}

module.exports = PlayerStatService;