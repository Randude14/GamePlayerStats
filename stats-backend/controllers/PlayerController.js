const { check } = require('express-validator');
const validateErrors = require('../middleware/validateErrors');
const auth = require('../middleware/auth');

class PlayerController {

    constructor(playerService) {
        this.playerService = playerService;
    }

    registerRoutes(app) {
        app.get('/players', 
            this.getAllPlayers.bind(this));

        app.post('/auth/login', [
            check('email', 'Please include your email.').notEmpty(),
            check('password', 'Please include your password.').notEmpty()
        ], validateErrors(), this.playerAuth.bind(this));

        app.post('/players', [
            check('name', 'Please include your name.').notEmpty(),
            check('email', 'Please include your email.').notEmpty(),
            check('username', 'Please include a username of at least 6 characters.').isLength({ min: 6}),
            check('password', 'Please include a password of at least 8 characters.').isLength({ min: 8 }),
        ], validateErrors(), this.createPlayer.bind(this));

        app.delete('/players/me', auth, this.removePlayer.bind(this));

        app.put('/players/username', [
            auth,
            check('username', 'Please include a username of at least 6 characters.').isLength({ min: 6})
        ], validateErrors(), this.updatePlayerUsername.bind(this));
    }

    async getAllPlayers(req, res) {
        const rows = await this.playerService.getAllPlayers();
        res.json(rows);
    }

    async createPlayer(req, res) {



        try {
            const player = await this.playerService.createPlayer(req.body);

            return res.status(201).json(player);
        } 
        catch (err) {
            console.log(err.message);
            return res.status(err.statusCode || 400).json({ error: err.message });
        }
    }

    async playerAuth(req, res) {

        try {
            const token = await this.playerService.authPlayer(req.body);
            return res.status(201).json( token )
        }
        catch(err) {
            console.log(err.message);
            return res.status(err.statusCode || 400).json({ error: err.message });
        }
    }

    async removePlayer(req, res) {
        const playerId = req.player.id;
        
        try {
            await this.playerService.deletePlayer(playerId);
            return res.status(200).json({ msg: 'Player removed.' })
        }
        catch(err) {
            console.log(err.message);
            return res.status(err.statusCode || 400).json({ error: err.message });
        }

    }

    async updatePlayerUsername(req, res) {

        const playerId = req.player.id;
        const playerName = req.body.username;

        try {
            await this.playerService.updateUsername(playerId, playerName);
            return res.status(200).json({ msg: 'Username updated.' });
        } catch (err) {
            console.error(err);
            res.status(err.statusCode || 400).json({ error: err.message });
        } 
    }
}

module.exports = PlayerController;