const AppError = require('../util/AppError');
const extractExistingData = require('../util/extractExistingData');

class PlayerStatService {

    constructor(_knex) {
        this.knex = _knex;
        this.PLAYER_STAT_TABLE = 'player_stats';
    }

    async getAllStats() {
        const stats = await this.knex(this.PLAYER_STAT_TABLE);
        return stats;
    }

    async getAllStatsFor(player_id) {
        const stats = await this.knex(this.PLAYER_STAT_TABLE).where({ player_id });
        return stats;
    }

    async getById(id) {
        const stat = await this.knex(this.PLAYER_STAT_TABLE).where({ id }).first();

        if(!stat) {
            throw new AppError('Player stat not found with id ' + id, 404);
        }

        return stat;
    }

    async getByPlayerAndGame(player_id, game_id) {
        if(!player_id || !game_id) {
            throw new AppError('Player id and/or game id not provided.', 400);
        }

        const stat = await this.knex(this.PLAYER_STAT_TABLE).where({ player_id, game_id }).first();

        if(!stat) {
            throw new AppError(`Could not find game for ${player_id} and ${game_id}`, 404);
        }

        return stat;
    }

    async createPlayerStat(player_id, data) {
        const {game_id, hours_played, date_purchased} = data;

        const playerStatCheck = await this.knex(this.PLAYER_STAT_TABLE)
                                .where({
                                    player_id,
                                    game_id
                                }).first();

        if(playerStatCheck) {
            throw new AppError('A player stat already exists.', 409);
        }

        const playerStat = await this.knex(this.PLAYER_STAT_TABLE).insert({
            player_id,
            game_id,
            hours_played, 
            date_purchased,
            created_at: this.knex.fn.now()
        });

        return playerStat;
    }

    async updatePlayerStat(id, data) {
        const existingStat = await this.knex(this.PLAYER_STAT_TABLE).where({ id }).first();

        if(!existingStat) {
            throw new AppError('Player stat does not exist.', 404);
        }

        // Only update existing fields
        const dataToUpdate = extractExistingData(['hours_played', 'date_purchased'], data);

        const stat = await this.knex(this.PLAYER_STAT_TABLE)
            .where({ id })
            .update(dataToUpdate);
        return stat;
    }

    async deletePlayerStat(id) {
        const playerStatCheck = await this.knex(this.PLAYER_STAT_TABLE)
                                        .where({ id }).first();

        if(! playerStatCheck) {
            throw new AppError('Player stat does not exist.', 404);
        }

        await this.knex(this.PLAYER_STAT_TABLE).where({ id }).delete();
        return playerStatCheck;
    }

}

module.exports = PlayerStatService;