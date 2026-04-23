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
        app.get('/player_stats/all', this.catchAsyncRoute(this.getAllStats));

        app.get('/player_stats/search/:player_id/game/:game_id', this.catchAsyncRoute(this.getPlayerStatFor));

        app.get('/player_stats/search/:player_id', this.catchAsyncRoute(this.getAllPlayerStatsFor));

        app.get('/player_stats/me', auth, this.catchAsyncRoute(this.getAllPlayerStatsForMe));

        app.get('/player_stats/dashboard/:player_id', this.catchAsyncRoute(this.captureDashboardInfo));

        app.post('/player_stats', [
            auth,
            check('game_id', 'Please include the id of the game.'),
            checkDate('date_purchased'),
            checkNotNegative('hours_played')
        ], validateErrors(), this.catchAsyncRoute(this.addPlayerStat));

        app.patch('/player_stats/:stat_id', [
            auth,
            checkDate('date_purchased', false),
            checkNotNegative('hours_played', false),
        ], validateErrors(), this.catchAsyncRoute(this.updatePlayerStat));

        app.delete('/player_stats/me/:stat_id', [
            auth
        ], validateErrors(), this.catchAsyncRoute(this.deletePlayerStat));

    }

    catchAsyncRoute(_func) {
        return catchAsync(_func.bind(this));
    }

    async getAllStats(req, res) {
        const rows = await this.playerStatService.getAllStats();
        return res.status(200).json({results: rows});
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

    async getAllPlayerStatsForMe(req, res) {
        const player_id = req.player.id;
        const playerStatRows = await this.playerStatService.getAllStatsFor(player_id);
        return res.status(200).json({results: playerStatRows});
    }

    async captureDashboardInfo(req, res) {
        const player_id = req.params.player_id;
        console.log(player_id);
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