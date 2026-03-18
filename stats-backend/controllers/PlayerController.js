class PlayerController {

    constructor(_pool, _knex) {
        this.pool = _pool;
        this.knex = _knex;
    }

    registerRoutes(app) {
        app.get('/players', this.getAllPlayers.bind(this));
        app.post('/players/add', this.addPlayer.bind(this));
    }

    async getAllPlayers(req, res) {
        const [rows] = await this.pool.query('SELECT * FROM players');
        res.json(rows);
    }

    async addPlayer(req, res) {
        try {
            await knex('players').insert({
            name: 'JohnDoe',
            email: 'johndoe@gmail.com',
            username: 'JohnDoesNuts',
            created_at: knex.fn.now()
            })

            const created = await pool.query('SELECT * FROM players WHERE players.name = ?', ['John Doe'])

            return res.json(created);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        } 
    }
}

module.exports = PlayerController;