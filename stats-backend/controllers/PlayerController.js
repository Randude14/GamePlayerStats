const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

class PlayerController {

    constructor(_pool, _knex) {
        this.pool = _pool;
        this.knex = _knex;
    }

    registerRoutes(app) {
        app.get('/players', 
            this.getAllPlayers.bind(this));
        app.post('/players/create', [
            check('name', 'Please include your name.'),
            check('email', 'Please include your email.'),
            check('username', 'Please include a username.'),
            check('password', 'Please include a password of at least 8 characters.').isLength({ min: 8 }),
        ], this.createPlayer.bind(this));
        app.delete('/players', auth, this.removePlayer.bind(this));
    }

    async getAllPlayers(req, res) {
        const [rows] = await this.pool.query('SELECT * FROM players');
        res.json(rows);
    }

    async createPlayer(req, res) {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, username } = req.body;
        let { password } = req.body;

        let [playerFound] = await this.pool.query('SELECT * FROM players WHERE players.email = ?', [email]);

        if(playerFound && playerFound.length > 0) {
            return res.status(400).json({ msg: 'There is a player already with that email.'});
        }

        [playerFound] = await this.pool.query('SELECT * FROM players WHERE players.username = ?', [username]);

        if(playerFound && playerFound.length > 0) {
            return res.status(400).json({ msg: 'There is a player already with that username.'});
        }

        try {
            // encrypt password
            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(password, salt);

            await this.knex('players').insert({
                name: name,
                email: email,
                username: username,
                password: password,
                created_at: this.knex.fn.now()
            })

            const [playerCreated] = await this.pool.query('SELECT * FROM players WHERE players.username = ?', [username]);

            const payload = {
                player: {
                    username : playerCreated[0].username
                }
            }

            // return secret token to player
            jwt.sign(payload, 
                config.get('jwtSecret'), 
                { expiresIn: 360000 }, 
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        } 
    }

    async removePlayer(req, res) {

        const username = req.player.username;

        try {
            const [player] = await this.pool.query('SELECT * FROM players WHERE players.username = ?', [username])

            if(! player || player.length === 0) {
                return res.status(401).json({ msg: "Could not find user."});
            }

            await this.pool.execute('DELETE FROM players WHERE players.username = ?', [username])

            return res.json({msg: 'Player removed.'});
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        } 
    }
}

module.exports = PlayerController;