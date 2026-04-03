const auth = require('../middleware/auth')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const AppError = require('../util/AppError');
const extractExistingData = require('../util/extractExistingData');
const {Table} = require('../util/tables');

class PlayerService {

    constructor(_knex) {
        this.knex = _knex;
        this.passwordField = 'password_hash';
    }

    async getAllPlayers() {
        const players = await this.knex(Table.PLAYER_TABLE);
        players.forEach(p => delete p[this.passwordField]);
        return players;
    }

    async getById(id) {
        const player = await this.knex(Table.PLAYER_TABLE).where({ id }).first();

        if(!player) {
            throw new AppError('Player not found with id ' + id, 404);
        }

        delete player[this.passwordField];

        return player;
    }

    // Returns token
    async createPlayer(data) {

        const { name, email, username, password } = data;

        const existingPlayer = await this.knex(Table.PLAYER_TABLE).where({ email }).orWhere({ username }).first();

        if(existingPlayer) {
            if(existingPlayer.email === email) {
                throw new AppError('There is a player already with that email.', 409);
            }
            throw new AppError('There is a player already with that username.', 409);
        }
        
        const password_hash = await bcrypt.hash(password, 10);

        const [id] = await this.knex(Table.PLAYER_TABLE).insert({
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
        const playerFound = await this.knex(Table.PLAYER_TABLE).where({ email }).first();

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

    async updatePlayer(id, data) {
        let username = data['username'];
        let email = data['email'];

        let query = this.knex(Table.PLAYER_TABLE);

        if(username && email) {
            query = query.where({ username }).orWhere({ email });
        }
        else if(username) {
            query = query.where({ username });
        }
        else if(email) {
            query = query.where({ email });
        }
        else {
            throw new AppError('No email or username provided.', 400);
        }

        const playerFound = await query.first();

        if(playerFound) {
            throw new AppError('There is a player already with that username and/or email.', 409);
        }

        // Only update existing fields
        const dataToUpdate = extractExistingData(['username', 'email'], data);

        await this.knex(Table.PLAYER_TABLE)
            .where({ id })
            .update(dataToUpdate);
    }

    async deletePlayer(id) {
        const player = await this.knex(Table.PLAYER_TABLE).where({ id });

        if(! player || player.length === 0) {
            throw new AppError('Player not found.', 404);
        }

        await this.knex(Table.PLAYER_TABLE).where({ id }).delete();
    }

}

module.exports = PlayerService;