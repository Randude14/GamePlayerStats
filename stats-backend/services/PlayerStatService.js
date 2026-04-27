const AppError = require('../util/AppError');
const extractExistingData = require('../util/extractExistingData');
const {Table} = require('../util/tables');

const PLAYER_STAT_FITLERS = {
    PLAYER_AND_GAME: 0,
    PLAYER_ONLY: 1,
    GAME_ONLY: 2
}

class PlayerStatService {

    constructor(_knex) {
        this.knex = _knex;
    }

    async getAllStats() {
        const rows = await this.knex(Table.PLAYER_STAT_TABLE).select('*');
        return rows;
    }

    

    async searchAllStatsFor(search, page, pageSize, filter) {
        const offset = (page - 1) * pageSize;
        const trimmedQuery = search?.trim();

        // optional queries for searching by username or game title
        const applyFilters = (query) => {
            
            if(trimmedQuery && trimmedQuery.length) {

                if(filter === PLAYER_STAT_FITLERS.PLAYER_AND_GAME) {
                    query.where('p.username', 'like', `%${trimmedQuery}%`)
                        .orWhere('g.title', 'like', `%${trimmedQuery}%`);
                }
                else if(filter === PLAYER_STAT_FITLERS.PLAYER_ONLY) {
                    query.where('p.username', 'like', `%${trimmedQuery}%`);
                }
                else if(filter === PLAYER_STAT_FITLERS.GAME_ONLY) {
                    query.where('g.title', 'like', `%${trimmedQuery}%`);
                }
            }
            return query;
        };

        const statsResults = await applyFilters(
            this.knex(`${Table.PLAYER_STAT_TABLE} as ps`)
                .join(`${Table.GAME_TABLE} as g`, 'ps.game_id', 'g.id')
                .join(`${Table.PLAYER_TABLE} as p`, 'ps.player_id', 'p.id')
        )
        .select(
            'ps.player_id',
            'ps.game_id',
            'ps.hours_played',
            'ps.date_purchased',
            'p.username as username',
            'g.cover_url as game_cover_url',
            'g.title as game_title',
            'g.release as game_release',
            'g.developers as game_developers',
            'g.publishers as game_publishers'
        )
        .limit(pageSize)
        .offset(offset);

        const totalRows = await applyFilters(
            this.knex(`${Table.PLAYER_STAT_TABLE} as ps`)
                .join(`${Table.GAME_TABLE} as g`, 'ps.game_id', 'g.id')
                .join(`${Table.PLAYER_TABLE} as p`, 'ps.player_id', 'p.id')
        )
        .count('ps.id as total').first();

        const totalResults = Number(totalRows.total);
        const totalPages = Math.ceil(totalResults / pageSize);

        return {
            query: trimmedQuery,
            page,
            pageSize,
            totalResults,
            totalPages,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
            results: statsResults
        }
    }

    async searchAllPlayerStatsFor(player_id, gameQuery, page, pageSize) {
        const offset = (page - 1) * pageSize;
        const trimmedQuery = gameQuery?.trim();

        const applyFilters = (query) => {
            query.where('ps.player_id', player_id);

            // Add optional query if not blank
            if (trimmedQuery) {
                query.andWhere('g.title', 'like', `%${trimmedQuery}%`);
            }
            return query;
        };

        const statsResults = await applyFilters(
            this.knex(`${Table.PLAYER_STAT_TABLE} as ps`)
                .join(`${Table.GAME_TABLE} as g`, 'ps.game_id', 'g.id')
        )
        .select(
            'ps.player_id',
            'ps.game_id',
            'ps.hours_played',
            'ps.date_purchased',
            'g.cover_url as game_cover_url',
            'g.title as game_title',
            'g.release as game_release',
            'g.developers as game_developers',
            'g.publishers as game_publishers'
        )
        .limit(pageSize)
        .offset(offset);

        const totalRows = await applyFilters(
            this.knex(`${Table.PLAYER_STAT_TABLE} as ps`)
                .join(`${Table.GAME_TABLE} as g`, 'ps.game_id', 'g.id')
        )
        .count('ps.id as total').first();

        const totalResults = Number(totalRows.total);
        const totalPages = Math.ceil(totalResults / pageSize);

        return {
            query: trimmedQuery,
            page,
            pageSize,
            totalResults,
            totalPages,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
            results: statsResults
        }
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

    async getPlayerDashboardInfo(player_id) {
        
        const dashboardInfo = await this.knex(`${Table.PLAYER_STAT_TABLE} as ps`)
            .where('ps.player_id', player_id)
            .sum('ps.hours_played as total_hours')
            .count('ps.game_id as total_games')
            .first();

        const totalHours = dashboardInfo["total_hours"];
        const totalGames = dashboardInfo["total_games"];
        if(! totalHours) dashboardInfo["total_hours"] = 0;
        if(! totalGames) dashboardInfo["total_games"] = 0;

        return dashboardInfo;
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