const { check, validationResult } = require('express-validator');

class PlayerController {

    constructor(_pool, _knex) {
        this.pool = _pool;
        this.knex = _knex;
    }

    registerRoutes(app) {
        app.get('/players', 
            this.getAllPlayers.bind(this));
        app.post('/players/add', [
            check('name', 'Please include your name.'),
            check('email', 'Please include your email.'),
            check('username', 'Please include a username.'),
        ], this.addPlayer.bind(this));
        app.delete('/players', [
            check('email', 'Please include the email of the user to delete.')
        ], this.removePlayer.bind(this));
    }

    async getAllPlayers(req, res) {
        const [rows] = await this.pool.query('SELECT * FROM players');
        res.json(rows);
    }

    async addPlayer(req, res) {

        const { name, email, username } = req.body;

        try {
            await this.knex('players').insert({
                name: name,
                email: email,
                username: username,
                created_at: this.knex.fn.now()
            })

            const [createdPlayer] = await this.pool.query('SELECT * FROM players WHERE players.username = ?', [username])

            return res.json(createdPlayer);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        } 
    }

    async removePlayer(req, res) {

        const { email } = req.body;

        try {
            const [player] = await this.pool.query('SELECT * FROM players WHERE players.email = ?', [email])

            if(! player || player.length === 0) {
                return res.status(401).json({ msg: "Could not find user for " + email})
            }

            await this.pool.execute("DELETE FROM players WHERE players.email = ?", [email])

            return res.json({msg: 'Player removed.'});
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        } 
    }
}

module.exports = PlayerController;