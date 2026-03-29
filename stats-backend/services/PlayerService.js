const auth = require('../middleware/auth')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const AppError = require('../util/AppError');

class PlayerService {

    constructor(_knex) {
        this.knex = _knex;
        this.PLAYER_TABLE = 'players';
    }

    async getAllPlayers() {
        const players = await this.knex(this.PLAYER_TABLE);
        return players;
    }

    async getById(id) {
        const player = await this.knex(this.PLAYER_TABLE).where({ id }).first();

        if(!player) {
            throw new AppError('Player not found with id ' + id, 404);
        }

        return player;
    }

    // Returns token
    async createPlayer(data) {

        const { name, email, username, password } = data;

        const existingPlayer = await this.knex(this.PLAYER_TABLE).where({ email }).orWhere({ username }).first();

        if(existingPlayer) {
            if(existingPlayer.email === email) {
                throw new AppError('There is a player already with that email.', 409);
            }
            throw new AppError('There is a player already with that username.', 409);
        }
        
        const password_hash = await bcrypt.hash(password, 10);

        const [id] = await this.knex(this.PLAYER_TABLE).insert({
            name: name,
            email: email,
            username: username,
            password_hash: password_hash,
            created_at: this.knex.fn.now()
        });

        const payload = {
            player: {
                id
            }
        }

        // return secret token to player
        const token = jwt.sign(payload, 
            config.get('jwtSecret'), 
            { expiresIn: 360000 }
        );

        return token;
    }

    async authPlayer(data) {
        const { email, password } = data;
        const playerFound = await this.knex(this.PLAYER_TABLE).where({ email }).first();

        if(!playerFound) {
            throw new AppError('Invalid Credentials.', 401);
        }

        // compare the password given and the encrypted password from mongodb
        const isMatch = await bcrypt.compare(password, playerFound.password_hash)

        if(!isMatch) {
            throw new AppError('Invalid Credentials.', 401);
        }

        const payload = {
            player: {
                id : playerFound.id
            }
        }

        const token = jwt.sign(payload, 
            config.get('jwtSecret'), 
            { expiresIn: 360000 }
        );

        return token;
    }

    async updateUsername(id, username) {
        const playerFound = await this.knex(this.PLAYER_TABLE).where({ username }).first();

        if(playerFound) {
            throw new AppError('There is a player already with that username.', 409);
        }

        await this.knex(this.PLAYER_TABLE)
            .where({ id })
            .update({ username });
    }

    async deletePlayer(id) {
        const player = await this.knex(this.PLAYER_TABLE).where({ id });

        if(! player || player.length === 0) {
            throw new AppError('Player not found.', 404);
        }

        await this.knex(this.PLAYER_TABLE).where({ id }).delete();
    }

}

module.exports = PlayerService;