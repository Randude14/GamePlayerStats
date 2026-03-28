const { check, validationResult } = require('express-validator');
const config = require('config');

class PlayerStatController {

    constructor(_knex) {
        this.knex = _knex;
        this.PLAYER_STAT_TABLE = "player_stats";
    }

    registerRoutes(app) {
        app.get('/player_stats/all', this.getAllStats.bind(this));

        app.post('/player_stats/add/:player_id/:game_id', [
            check('date_purchased').notEmpty(),
            check('hours_played').notEmpty()
        ], this.addPlayerStat.bind(this));

        app.patch('/player_stats/set/:player_id/:game_id',
            check('hours_played').notEmpty()
        , this.setPlayerStat.bind(this));

        app.get('/player_stats/search/:player_id/:game_id', this.getGameStatsFor.bind(this));
        
        app.get('/player_stats/search/:player_id', this.getPlayerStatsFor.bind(this));

        app.delete('/player_stats/:player_id/:game_id', this.deletePlayerStat.bind(this))

    }

    async getAllStats(req, res) {
        const rows = await this.knex(this.PLAYER_STAT_TABLE);
        return res.json(rows);
    }

    async addPlayerStat(req, res) {
        const {player_id, game_id} = req.params;

        if(!player_id || !game_id) {
            return res.status(400).json({ error: 'Played id and Game id were not provided.' });
        }

        const {date_purchased, hours_played} = req.body;

        if(this.validateDate(date_purchased)) {
            return res.status(400).json({ error: "Invalid date format (use YYYY-MM-DD)" });
        }

        if(hours_played < 0) {
            return res.status(400).json({ error: 'The hours played field cannot be negative.' })
        }

        const playerStatCheck = await this.knex(this.PLAYER_STAT_TABLE)
                                    .where({
                                        player_id: player_id,
                                        game_id: game_id
                                    }).first();

        if(playerStatCheck) {
            return res.status(409).json({ error: 'Stat record already exists.' })
        }
        
        await this.knex(this.PLAYER_STAT_TABLE)
                    .insert({
                        player_id: player_id,
                        game_id: game_id,
                        hours_played: hours_played,
                        date_purchased: date_purchased,
                        created_at: this.knex.fn.now()
                    });
        

        const playerStat = await this.knex(this.PLAYER_STAT_TABLE)
                                    .where({
                                        player_id: player_id,
                                        game_id: game_id
                                    }).first();

        // Stat failed to be created
        if(!playerStat) {
            return res.status(500).json({ error: 'Server error: player stat failed to create for passed parameters and body.' });
        }

        return res.status(201).json(playerStat);
    }

    async setPlayerStat(req, res) {
        const {player_id, game_id} = req.params;

        if(!player_id || !game_id) {
            return res.status(400).json({ error: 'Played id and Game id were not provided.' });
        }

        const { hours_played } = req.body;

        if(hours_played < 0) {
            return res.status(400).json({ error: 'The hours played field cannot be negative.' })
        }

        const playerStatCheck = await this.knex(this.PLAYER_STAT_TABLE)
                                    .where({
                                        player_id: player_id,
                                        game_id: game_id
                                    }).first();

        if(!playerStatCheck) {
            return res.status(409).json({ error: 'Could not find stat record.' })
        }
        
        await this.knex(this.PLAYER_STAT_TABLE)
                    .where({
                        player_id: player_id,
                        game_id: game_id
                    })
                    .update({
                        hours_played: hours_played
                    });

        const playerStat = await this.knex(this.PLAYER_STAT_TABLE)
                                    .where({
                                        player_id: player_id,
                                        game_id: game_id
                                    }).first();

        return res.status(201).json(playerStat);
    }

    async getGameStatsFor(req, res) {
        const {player_id, game_id} = req.params;

        if(!player_id || !game_id) {
            return res.status(400).json({ error: 'Played id and Game id were not provided.' });
        }

        const playerStats = await this.knex(this.PLAYER_STAT_TABLE)
                                    .where({
                                        player_id: player_id, 
                                        game_id: game_id 
                                    }).first();

        if(!playerStats) {
            return res.status(409).json({ error: 'Could not find a stat record.' })
        }

        return res.status(201).json(playerStats);
    }

    async getPlayerStatsFor(req, res) {
        const player_id = req.params.player_id;

        if(!player_id) {
            return res.status(400).json({ msg: 'Played id was not provided.' });
        }

        const playerStatRows = await this.knex(this.PLAYER_STAT_TABLE)
                                        .where({
                                            player_id: player_id
                                        });

        return res.status(201).json(playerStatRows);
    }

    async deletePlayerStat(req, res) {
        const {player_id, game_id} = req.params;

        if(!player_id || !game_id) {
            return res.status(400).json({ error: 'Played id and Game id were not provided.' });
        }

        const playerStats = await this.knex(this.PLAYER_STAT_TABLE)
                                    .where({
                                        player_id: player_id, 
                                        game_id: game_id 
                                    }).first();

        if(!playerStats) {
            return res.status(409).json({ error: 'Could not find a stat record.' })
        }

        await this.knex(this.PLAYER_STAT_TABLE)
                                    .where({
                                        player_id: player_id, 
                                        game_id: game_id 
                                    }).delete();

        return res.json({ msg: 'Record deleted.' });
    }

    validateDate(date) {
        // Validate the release date, MySQL epects YYY-MM-DD
        return !date || !/^\d{4}-\d{2}-\d{2}$/.test(date);
    }
}

module.exports = PlayerStatController;