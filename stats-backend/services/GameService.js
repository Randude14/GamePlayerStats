const AppError = require('../util/AppError');
const extractExistingData = require('../util/extractExistingData');
const {Table} = require('../util/tables');

class GameService {

    constructor(_knex) {
        this.knex = _knex;
    }

    async getAllGames() {
        const games = await this.knex(Table.GAME_TABLE);
        return games;
    }

    async getById(id) {
        const game = await this.knex(Table.GAME_TABLE).where({ id }).first();

        if(!game) {
            throw new AppError('Game not found with id ' + id, 404);
        }

        return game;
    }

    async getByTitleRelease(title, release) {
        if(!title || !release) {
            throw new AppError('title and/or release not provided.', 400);
        }

        const game = await this.knex(Table.GAME_TABLE).where({ title, release }).first();

        if(!game) {
            throw new AppError(`Could not find game for ${title} and ${release}`, 404);
        }

        return game;
    }

    async createGame(data) {
        const {title, developers, publishers, release, cover_url, external_id, external_source} = data;

        if(!title || !release) {
            throw new AppError('title and/or release not provided.', 400);
        }

        let gameCheck = await this.knex(Table.GAME_TABLE)
                                .where({
                                    title: title,
                                    release: release
                                }).first();

        if(gameCheck) {
            throw new AppError('This game already exists.', 409);
        }

        gameCheck = await this.knex(Table.GAME_TABLE)
                                .whereNotNull('external_id')
                                .where({
                                    external_id
                                }).first();

        if(gameCheck) {
            throw new AppError('This game has already been imported.', 400);
        }

        const game = await this.knex(Table.GAME_TABLE).insert({
            title,
            release,
            developers,
            publishers,
            cover_url,
            external_id,
            external_source,
            created_at: this.knex.fn.now()
        });

        return game;
    }

    async searchGames(search, page=1, pageSize=20) {
        const offset = (page - 1) * pageSize;

        // Grab internal games
        const internalGames = await this.knex(Table.GAME_TABLE)
            .select("*")
            .whereRaw("LOWER(title) LIKE ?", [`%${search.toLowerCase()}%`])
            .limit(pageSize)
            .offset(offset);
        
        const internalGameCount = await this.knex(`${Table.GAME_TABLE} as g`)
            .whereRaw("LOWER(title) LIKE ?", [`%${search.toLowerCase()}%`])
            .count('g.id as total_games');
        
        const totalResults = Number(internalGameCount[0].total_games);
        const totalPages = Math.ceil(totalResults / pageSize) ; 

        // Add isImported flag
        const results = internalGames.map(game => { return {
            ...game, 
            isImported: true,
            internal_id: game.id
        } });

        return {
            query: search,
            page,
            pageSize,
            totalResults,
            totalPages,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
            results
        };
    }

    async updateGame(id, data) {
        const existingGame = await this.knex(Table.GAME_TABLE).where({ id }).first();

        if(!existingGame) {
            throw new AppError('Game does not exist.', 404);
        }

        // Only update existing fields
        const dataToUpdate = extractExistingData(['title', 'developer', 'publisher', 'release'], data);

        await this.knex(Table.GAME_TABLE)
            .where({ id })
            .update(dataToUpdate);
    }

    async deleteGame(id) {
        const existingGame = await this.knex(Table.GAME_TABLE)
                                        .where({ id }).first();

        if(! existingGame) {
            throw new AppError('Game does not exist.', 404);
        }

        await this.knex(Table.GAME_TABLE).where({ id }).delete();
        return existingGame;
    }

}

module.exports = GameService;