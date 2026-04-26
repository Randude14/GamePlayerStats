const { check } = require('express-validator');
const checkDate = require('../middleware/checkDate');
const checkNotNegative = require('../middleware/checkNotNegative');
const auth = require('../middleware/auth');
const catchAsync = require('../middleware/catchAsync');
const validateErrors = require('../middleware/validateErrors');

class PlayerStatController {

    constructor(_playerService, _gameService, _playerStatService) {
        this.playerService = _playerService;
        this.gameService = _gameService;
        this.playerStatService = _playerStatService;
        this.PLAYER_STAT_TABLE = "player_stats";
    }

    registerRoutes(app) {

        app.get('/api/player_stats/all', this.catchAsyncRoute(this.getAllStats))

        app.get('/api/player_stats/all/search', this.catchAsyncRoute(this.searchAllStatsFor));

        app.get('/api/player_stats/search/:player_id/game/:game_id', this.catchAsyncRoute(this.getPlayerStatFor));

        app.get('/api/player_stats/search/:player_id', this.catchAsyncRoute(this.getAllPlayerStatsFor));

        app.get('/api/player_stats/me/search', auth, this.catchAsyncRoute(this.searchAllPlayerStatsFor));

        app.get('/api/player_stats/dashboard/:player_id', this.catchAsyncRoute(this.captureDashboardInfo));

        app.post('/api/player_stats', [
            auth,
            check('game_id', 'Please include the id of the game.'),
            checkDate('date_purchased'),
            checkNotNegative('hours_played')
        ], validateErrors(), this.catchAsyncRoute(this.addPlayerStat));

        app.patch('/api/player_stats/:stat_id', [
            auth,
            checkDate('date_purchased', false),
            checkNotNegative('hours_played', false),
        ], validateErrors(), this.catchAsyncRoute(this.updatePlayerStat));

        app.delete('/api/player_stats/me/:stat_id', [
            auth
        ], validateErrors(), this.catchAsyncRoute(this.deletePlayerStat));

    }

    catchAsyncRoute(_func) {
        return catchAsync(_func.bind(this));
    }

    async getAllStats(req, res) {
        const allStats = await this.playerStatService.getAllStats();
        return res.status(200).json({results: allStats});
    }

    async searchAllStatsFor(req, res) {
        const queryToSearch = req.query.query?.trim();
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 20;
        const searchType = !!req.query.searchType ? Boolean(req.query.searchType) : true;
        const playerStatResults = await this.playerStatService.searchAllStatsFor(queryToSearch, page, pageSize, searchType);
        return res.status(200).json(playerStatResults);
    }

    async getPlayerStatFor(req, res) {
        const {player_id, game_id} = req.params;
        const playerStats = await this.playerStatService.getByPlayerAndGame(player_id, game_id);
        return res.status(200).json(playerStats);
    } 

    async getAllPlayerStatsFor(req, res) {
        const player_id = req.params.player_id;
        const playerStatRows = await this.playerStatService.getAllStatsFor(player_id);
        return res.status(200).json({results: playerStatRows});
    }

    async searchAllPlayerStatsFor(req, res) {
        const player_id = req.player.id;
        const gameTitleToSearch = req.query.query?.trim();
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 20;
        const playerStatResults = await this.playerStatService.searchAllPlayerStatsFor(player_id, gameTitleToSearch, page, pageSize);
        return res.status(200).json(playerStatResults);
    }

    async captureDashboardInfo(req, res) {
        const player_id = req.params.player_id;
        const playerInfo = await this.playerService.getById(player_id);
        const dashboardInfo = await this.playerStatService.getPlayerDashboardInfo(player_id);
        return res.status(200).json({...playerInfo, ...dashboardInfo});
    }

    async addPlayerStat(req, res) {
        const player_id = req.player.id;
        const {game_id} = req.body;
        
        // Ensure player and games exist
        await this.playerService.getById(player_id);
        await this.gameService.getById(game_id);

        const playerStat = await this.playerStatService.createPlayerStat(player_id, req.body);
        return res.status(201).json(playerStat);
    }

    async updatePlayerStat(req, res) {
        const stat_id = req.params.stat_id;
        const playerStatCheck = await this.playerStatService.getById(stat_id);

        if(playerStatCheck.player_id != req.player.id) {
            return res.status(400).json({ error: 'User is not authorized to edit other players stats' });
        }

        const playerStat = await this.playerStatService.updatePlayerStat(stat_id, req.body);
        return res.status(200).json(playerStat);
    }

    async deletePlayerStat(req, res) {
        const stat_id = req.params.stat_id;
        const playerStatCheck = await this.playerStatService.getById(stat_id);

        if(playerStatCheck.player_id != req.player.id) {
            return res.status(400).json({ error: 'User is not authorized to delete other players stats' });
        }

        const playerStat = await this.playerStatService.deletePlayerStat(stat_id);
        return res.status(200).json(playerStat);
    }
}

module.exports = PlayerStatController;