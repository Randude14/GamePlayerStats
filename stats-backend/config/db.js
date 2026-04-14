const mysql = require('mysql2/promise');


async function connecToDB(retries = 10, delay = 1000) {

    console.log(process.env.DB_PASSWORD);
    console.log(process.env.DB_NAME);
    console.log(process.env.DB_USER);

    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'stats',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });

    for (let i = 0; i < retries; i++) {
        try {
            // If select goes through, DB is connected and return the pool
            await pool.query('SELECT 1');
            return pool;

        } catch (err) {

            if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
                console.log(`Database not ready yet (${i + 1}/${retries}), retrying in ${delay}ms`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            throw err;
        }
    }
    throw new Error(`Unable to connect to database after multiple attempts`)
}

module.exports = connecToDB