const AppError = require('../util/AppError');

class GameService {

    constructor(_knex) {
        this.knex = _knex;
        this.GAME_TABLE = 'games';
    }

    async getAllGames() {
        const games = await this.knex(this.GAME_TABLE);
        return games;
    }

    async getById(id) {
        const game = await this.knex(this.GAME_TABLE).where({ id }).first();

        if(!game) {
            throw new AppError('Game not found with id ' + id, 404);
        }

        return game;
    }

    async getByTitleRelease(title, release) {
        if(!title || !release) {
            throw new AppError('title and/or release not provided.', 400);
        }

        const game = await this.knex(this.GAME_TABLE).where({ title, release }).first();

        if(!game) {
            throw new AppError(`Could not find game for ${title} and ${release}`, 404);
        }

        return game;
    }

    async createGame(data) {
        const {title, developer, publisher, release} = data;

        const gameCheck = await this.knex(this.GAME_TABLE)
                                .where({
                                    title: title,
                                    release: release
                                }).first();

        if(gameCheck) {
            throw new AppError('This game already exists.', 409);
        }

        const game = await this.knex(this.GAME_TABLE).insert({
            title: title,
            developer: developer,
            publisher: publisher,
            release: release,
            created_at: this.knex.fn.now()
        });

        return game;
    }

    async updateGame(id, data) {
        const existingGame = await this.knex(this.GAME_TABLE).where({ id }).first();

        if(!existingGame) {
            throw new AppError('Game does not exist.', 404);
        }

        // Only update existing fields
        const dataToUpdate = {};
        ['title', 'developer', 'publisher', 'release'].forEach(field => {
            if(data[field]) {
                dataToUpdate[field] = data[field];
            }
        });

        // Add/update the updated_at date
        dataToUpdate.updated_at = this.knex.fn.now();

        await this.knex(this.GAME_TABLE)
            .where({ id })
            .update(dataToUpdate);
    }

    async deleteGame(id) {
        const existingGame = await this.knex(this.GAME_TABLE)
                                        .where({ id }).first();

        if(! existingGame) {
            throw new AppError('Game does not exist.', 404);
        }

        await this.knex(this.GAME_TABLE).where({ id }).delete();
        return existingGame;
    }

}

module.exports = GameService;