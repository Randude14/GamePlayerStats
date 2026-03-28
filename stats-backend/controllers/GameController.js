const { check, validationResult } = require('express-validator');
const config = require('config');

class GameController {

    constructor(_knex) {
        this.knex = _knex;
        this.GAME_TABLE = "games";
    }

    registerRoutes(app) {
        app.get('/games/all', this.getAllGames.bind(this));

        app.get('/games/search', [
            check('title', 'Please include the title.').notEmpty(),
            check('release', 'Please include the release date of the game.').notEmpty()
        ], this.getGameBy.bind(this));

        app.put('/games', [
            check('title', 'Please include the title.').notEmpty(),
            check('developer', 'Please include the deveoper.').notEmpty(),
            check('publisher', 'Please include the publisher.').notEmpty(),
            check('release', 'Please include the release date.').notEmpty()
        ], this.createGame.bind(this));

        app.delete('/games', [
            check('title', 'Please include the title.').notEmpty(),
            check('release', 'Please include the release date of the game to delete.').notEmpty()
        ], this.removeGame.bind(this));
    }

    async getAllGames(req, res) {
        const rows = await this.knex(this.GAME_TABLE);
        res.json(rows);
    }

    async getGameBy(req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {title, release} = req.body;

        if(this.validateDate(release)) {
            return res.status(400).json({ error: "Invalid date format (use YYYY-MM-DD)" });
        }

        const game = await this.knex(this.GAME_TABLE)
                                .where({
                                    title: title,
                                    release: release
                                }).first();

        if(!game) {
            return res.status(401).json({ error: 'Game does not exist for passed request body.' })
        }

        return res.status(201).json(game);
    }

    async createGame(req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {title, developer, publisher, release} = req.body;

        if(this.validateDate(release)) {
            return res.status(400).json({ error: "Invalid date format (use YYYY-MM-DD)" });
        }

        const gameCheck = await this.knex(this.GAME_TABLE)
                                .where({
                                    title: title,
                                    release: release
                                }).first();

        if(gameCheck) {
            return res.status(409).json({ msg: 'This game already exists.' })
        }

        await this.knex(this.GAME_TABLE).insert({
            title: title,
            developer: developer,
            publisher: publisher,
            release: release,
            created_at: this.knex.fn.now()
        });

        const gameCreated = await this.knex(this.GAME_TABLE)
                                .where({
                                    title: title,
                                    release: release
                                }).first();

        return res.status(201).send(gameCreated)
    }

    async removeGame(req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {title, release} = req.body;

        if(this.validateDate(release)) {
            return res.status(400).json({ error: "Invalid date format (use YYYY-MM-DD)" });
        }

        const gameCheck = await this.knex(this.GAME_TABLE)
                                .where({
                                    title: title,
                                    release: release
                                }).first();

        if(!gameCheck) {
            return res.status(409).json({ msg: 'This game does not exist.' })
        }

        await this.knex(this.GAME_TABLE)
                                .where({
                                    title: title,
                                    release: release
                                }).delete();

        return res.status(201).json({ msg: 'Game deleted.' })
    }


    validateDate(date) {
        // Validate the release date, MySQL epects YYY-MM-DD
        return !date || !/^\d{4}-\d{2}-\d{2}$/.test(date);
    }
}

module.exports = GameController;