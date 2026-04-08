const { check } = require('express-validator');
const validateErrors = require('../middleware/validateErrors');
const checkDate = require('../middleware/checkDate');
const catchAsync = require('../middleware/catchAsync');


class GameController {

    constructor(_gameService, _externalGameAPIService) {
        this.gameService = _gameService;
        this.externalGameAPIService = _externalGameAPIService;
    }

    registerRoutes(app) {
        app.get('/games', this.catchAsyncRoute(this.getAllGames));

        app.get('/games/id/:game_id', this.catchAsyncRoute(this.getGameById));

        app.get('/games/search/', this.catchAsyncRoute(this.getGameByTitleRelease));

        app.put('/games', [
            check('title', 'Please include the title.').notEmpty(),
            check('developer', 'Please include the deveoper.').notEmpty(),
            check('publisher', 'Please include the publisher.').notEmpty(),
            checkDate('release')
        ], validateErrors(), this.catchAsyncRoute(this.createGame));

        app.patch('/games/:game_id', [
            checkDate('release', false)
        ], validateErrors(), this.catchAsyncRoute(this.updateGame));

        app.post('/games/external/search/', this.catchAsyncRoute(this.searchExternalGames))

        app.delete('/games/:game_id', this.catchAsyncRoute(this.removeGame));
    }

    catchAsyncRoute(_func) {
        return catchAsync(_func.bind(this));
    }

    async getAllGames(req, res) {
        const games = await this.gameService.getAllGames();
        res.json(games);
    }

    async getGameById(req, res) {
        const game_id = req.params.game_id;
        const game = await this.gameService.getById(game_id);
        return res.status(200).json(game);
    }

    async getGameByTitleRelease(req, res) {
        const { title, release } = req.body;
        const game = await this.gameService.getByTitleRelease(title, release);
        return res.status(200).json(game);
    }

    async createGame(req, res) {
        const game = await this.gameService.createGame(req.body);
        return res.status(201).json(game);
    }

    async removeGame(req, res) {
        const gameId = req.params.game_id;
        const game = await this.gameService.deleteGame(gameId);
        return res.status(201).json(game);
    }

    async updateGame(req, res) {
        const gameId = req.params.game_id;
        await this.gameService.updateGame(req.body);
        const game = await this.gameService.getGameById(gameId);
        return res.status(201).json(game);
    }

    async searchExternalGames(req, res) {
        const gameTitleToSearch = req.query.query?.trim();
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 20;
        const games = await this.externalGameAPIService.searchExternalGames(gameTitleToSearch, page, pageSize);
        return res.status(200).json(games);
    }
}

module.exports = GameController;