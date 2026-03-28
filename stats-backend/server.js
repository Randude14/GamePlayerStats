const express = require('express');
const dotenv = require('dotenv');
const connecToDB = require('./config/db');
const knex = require('knex')(require('./knexfile'));
const PlayerController = require('./controllers/PlayerController');
const GameController = require('./controllers/GameController');
const PlayerStatController = require('./controllers/PlayerStatController');
dotenv.config();


const app = express();

(async () => {
    try {
        // init middleware
        app.use(express.json());

        // init database
        const pool = await connecToDB(30);

        // migrate after we establish db connection
        await knex.migrate.latest();

        app.get('/', (req, res) => {
          res.send('GamePlayerStats API is running');
        });

        // Create controllers and register their routes
        const playerController = new PlayerController(knex);
        playerController.registerRoutes(app);

        const gameController = new GameController(knex);
        gameController.registerRoutes(app);
      
        const playerStatController = new PlayerStatController(knex);
        playerStatController.registerRoutes(app);

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
})();
