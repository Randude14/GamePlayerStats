const { check } = require('express-validator');
const validateErrors = require('../middleware/validateErrors');
const auth = require('../middleware/auth');
const catchAsync = require('../middleware/catchAsync');

class PlayerController {

    constructor(_playerService) {
        this.playerService = _playerService;
    }

    registerRoutes(app) {
        app.get('/players', this.catchAsyncRoute(this.getAllPlayers));

        app.post('/auth/login', [
            check('email', 'Please include your email.').notEmpty(),
            check('password', 'Please include your password.').notEmpty()
        ], validateErrors(), this.catchAsyncRoute(this.playerAuth));

        app.post('/players', [
            check('name', 'Please include your name.').notEmpty(),
            check('email', 'Please include your email.').notEmpty(),
            check('username', 'Please include a username of at least 6 characters.').isLength({ min: 6}),
            check('password', 'Please include a password of at least 8 characters.').isLength({ min: 8 }),
        ], validateErrors(), this.catchAsyncRoute(this.createPlayer));

        app.delete('/players/me', auth, this.catchAsyncRoute(this.removePlayer));

        app.patch('/players', [
            auth,
        ], this.catchAsyncRoute(this.updatePlayer));
    }

    catchAsyncRoute(_func) {
        return catchAsync(_func.bind(this));
    }

    async getAllPlayers(req, res) {
        const rows = await this.playerService.getAllPlayers();
        return res.status(200).json(rows);
    }

    async createPlayer(req, res) {
        const player = await this.playerService.createPlayer(req.body);
        return res.status(201).json(player);
    }

    async playerAuth(req, res) {
        const token = await this.playerService.authPlayer(req.body);
        return res.status(200).json( token )
    }

    async removePlayer(req, res) {
        const playerId = req.player.id;
        await this.playerService.deletePlayer(playerId);
        return res.status(200).json({ message: 'Player removed.' });
    }

    async updatePlayer(req, res) {

        const playerId = req.player.id;
        await this.playerService.updatePlayer(playerId, req.body);
        return res.status(200).json({ message: 'Information updated.' });
    }
}

module.exports = PlayerController;