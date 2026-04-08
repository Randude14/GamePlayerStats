const express = require('express');
const dotenv = require('dotenv');
const connecToDB = require('./config/db');
const knex = require('knex')(require('./knexfile'));
const PlayerService = require('./services/PlayerService');
const ExternalGameAPIService = require('./services/ExternalGameAPIService');
const GameService = require('./services/GameService');
const PlayerStatService = require('./services/PlayerStatService');
const PlayerController = require('./controllers/PlayerController');
const GameController = require('./controllers/GameController');
const PlayerStatController = require('./controllers/PlayerStatController');
const globalErrorHandler = require('./middleware/globalErrorHandler');


dotenv.config();


const app = express();

(async () => {
    try {
        // init middleware
        app.use(express.json());

        const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173']
        const corsOptions = {
          origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) !== -1) {
              callback(null, true);
            } else {
              callback(new Error('Not allowed by CORS'));
            }
          }
        };

        const cors = require('cors');
        app.use(cors(corsOptions));

        // init database
        const pool = await connecToDB(30);

        // migrate after we establish db connection
        await knex.migrate.latest();

        app.get('/', (req, res) => {
          res.send('GamePlayerStats API is running');
        });

        // Create services
        const externalGameAPIService = new ExternalGameAPIService(knex);
        const playerService = new PlayerService(knex);
        const gameService = new GameService(knex);
        const playerStatService = new PlayerStatService(knex);

        // Create controllers and register their routes
        const playerController = new PlayerController(playerService);
        playerController.registerRoutes(app);

        const gameController = new GameController(gameService, externalGameAPIService);
        gameController.registerRoutes(app);
      
        const playerStatController = new PlayerStatController(playerService, gameService, playerStatService);
        playerStatController.registerRoutes(app);

        // Add global error handler last after routes
        app.use(globalErrorHandler);

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
})();
