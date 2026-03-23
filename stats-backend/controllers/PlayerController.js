const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

class PlayerController {

    constructor(_knex) {
        this.knex = _knex;
    }

    registerRoutes(app) {
        app.get('/players', 
            this.getAllPlayers.bind(this));
        app.post('/players/auth', [
            check('email', 'Please include your email.'),
            check('password', 'Please include your password.')
        ], this.playerAuth.bind(this)), 
        app.post('/players/create', [
            check('name', 'Please include your name.'),
            check('email', 'Please include your email.'),
            check('username', 'Please include a username of at least 6 characters.').isLength({ min: 6}),
            check('password', 'Please include a password of at least 8 characters.').isLength({ min: 8 }),
        ], this.createPlayer.bind(this));
        app.delete('/players', auth, this.removePlayer.bind(this));
        app.put('/players/username/', [
            auth,
            check('username', 'Please include a username of at least 6 characters.').isLength({ min: 6})
        ], this.updatePlayerUsername.bind(this));
    }

    async getAllPlayers(req, res) {
        const rows = await this.knex('players');
        res.json(rows);
    }

    async createPlayer(req, res) {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, username, password } = req.body;

        let playerFound = await this.knex('players').where({ email: email }).first();

        if(playerFound) {
            return res.status(400).json({ msg: 'There is a player already with that email.'});
        }

        playerFound = await this.knex('players').where({ username: username }).first();

        if(playerFound) {
            return res.status(400).json({ msg: 'There is a player already with that username.'});
        }

        try {
            // encrypt password
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            await this.knex('players').insert({
                name: name,
                email: email,
                username: username,
                password_hash: password_hash,
                created_at: this.knex.fn.now()
            })

            const playerCreated = this.knex('players').where({ username: username }).first();

            const payload = {
                player: {
                    id : playerCreated.id
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

    async playerAuth(req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const email = req.body.email;
        const password = req.body.password;

        try {
            const playerFound = await this.knex('players').where({ email: email}).first();

            if(!playerFound) {
                return res.status(401).json({ msg: 'Invalid Credentials.' })
            }

            // compare the password given and the encrypted password from mongodb
            const isMatch = await bcrypt.compare(password, playerFound.password_hash)

            if(!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const payload = {
                player: {
                    id : playerFound.id
                }
            }

            jwt.sign(payload, 
                config.get('jwtSecret'), 
                { expiresIn: 360000 }, 
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }

    async removePlayer(req, res) {

        const playerId = req.player.id;

        try {
            const player = await this.knex('players').where({ id: playerId }).delete();

            if(! player || player.length === 0) {
                return res.status(401).json({ msg: "Could not find user."});
            }

            await this.knex('players').where({ id: playerId }).delete();

            return res.json({msg: 'Player removed.'});
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        } 
    }

    async updatePlayerUsername(req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const playerId = req.player.id;
        const playerName = req.body.username;

        try {
            const playerFound = await this.knex('players').where({ username: playerName }).first();

            if(playerFound) {
                return res.status(401).json({ msg: 'There is a player already with that username.' })
            }

            await this.knex('players')
                .where({ id: playerId })
                .update({ username: playerName });

            return res.json({msg: 'Username updated.'});
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        } 
    }
}

module.exports = PlayerController;