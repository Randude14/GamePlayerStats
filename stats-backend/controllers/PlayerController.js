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

        app.get('/players/me', auth, this.catchAsyncRoute(this.getPlayerInfo));

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

        app.patch('/players/me/email', [
            auth,
            check('email', 'Please include an email.').notEmpty()
        ], this.catchAsyncRoute(this.updatePlayerEmail));

        app.patch('/players/me/username', [
            auth,
            check('username', 'Please include a username.').notEmpty()
        ], this.catchAsyncRoute(this.updatePlayerUsername));

        app.patch('/players/me/name', [
            auth,
            check('name', 'Please include a name.').notEmpty()
        ], this.catchAsyncRoute(this.updatePlayerName));

        app.patch('/players/me/password', [
            auth,
            check('old_password', 'Please include your current password.').notEmpty(),
            check('new_password', 'Please include your new password of at least 8 characters.').isLength({ min: 8 }).notEmpty()
        ], validateErrors(), this.catchAsyncRoute(this.updatePlayerPassword));
    }

    catchAsyncRoute(_func) {
        return catchAsync(_func.bind(this));
    }

    async getAllPlayers(req, res) {
        const rows = await this.playerService.getAllPlayers();
        return res.status(200).json(rows);
    }

    async getPlayerInfo(req, res) {
        const player = await this.playerService.getById(req.player.id);
        return res.status(200).json(player);
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

    async updatePlayerEmail(req, res) {
        const playerId = req.player.id;
        const email = req.body.email;
        await this.playerService.updatePlayerEmail(playerId, email);
        return res.status(200).json({ message: 'Email updated.' });
    }

    async updatePlayerUsername(req, res) {
        const playerId = req.player.id;
        const username = req.body.username;
        await this.playerService.updatePlayerUsername(playerId, username);
        return res.status(200).json({ message: 'Username updated.' });
    }

    async updatePlayerName(req, res) {
        const playerId = req.player.id;
        const name = req.body.name;
        await this.playerService.updatePlayerName(playerId, name);
        return res.status(200).json({ message: 'Name updated.' });
    }

    async updatePlayerPassword(req, res) {
        const playerId = req.player.id;
        const old_password = req.body.old_password;
        const new_password = req.body.new_password;
        const token = await this.playerService.updatePlayerPassword(playerId, old_password, new_password);
        return res.status(200).json({ message: 'Password updated.', token });
    }
}

module.exports = PlayerController;