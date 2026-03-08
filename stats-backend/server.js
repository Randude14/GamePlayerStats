const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

// simple ping route
app.get('/', (req, res) => {
  res.send('GamePlayerStats API is running');
});

// connect to mysql using pool for reuse
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'stats',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// simple retry helper to wait for DB to be reachable
async function waitForDb(retries = 10, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log(`Database not ready yet (${i + 1}/${retries}), retrying in ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Unable to connect to database after multiple attempts');
}

// knex instance for migrations
const knex = require('knex')(require('./knexfile'));

app.get('/players', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM players');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 3000;

// startup sequence: wait for database, run migrations, then listen
(async () => {
  try {
    await waitForDb();
    console.log('Running migrations');
    await knex.migrate.latest();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
