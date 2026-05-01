const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

dotenv.config();

const requiredEnvVars = [
    "PORT", 
    "TWITCH_CLIENT_ID", 
    "TWITCH_CLIENT_SECRET", 
    "CORS_ORIGIN", 
    "JWT_SECRET",  
    "DB_HOST", 
    "DB_USER", 
    "DB_PASSWORD", 
    "DB_NAME",
    "DB_PORT" 
];

function checkEnvVars() {
    let allGood = true;
    console.log('Checking required environment variables...');

    for (const key of requiredEnvVars) {
        if (!process.env[key]) {
            console.log(`Missing: ${key}`);
            allGood = false;
        } else {
            console.log(`Found: ${key}`);
        }
    }

    if(allGood) console.log('All required environment variables are present.');
    else        console.error('Required environment variables missing.');
    return allGood;
}

async function checkDatabaseConnection(retries = 10, retryPause = 3000) {
    for (let x = 1; x <= retries; ++x) {
        let connection;

        try {
            console.log(`\nConnecting to database... attempt ${x}/${retries}`);

            connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: Number(process.env.DB_PORT),
            });

            await connection.ping();
            console.log("\nDatabase connection successful.");
            return;
        } catch (err) {
            console.error(`Database connection failed on attempt ${x}/${retries}`);

            if (x >= retries) {
                console.error(err);
                process.exit(1);
            }

            await new Promise((resolve) => setTimeout(resolve, retryPause));
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
}

async function main() {
    const isEnvOk = checkEnvVars();

    if(!isEnvOk) {
        console.error('Fix missing environment variables before redeploying the API.');
        process.exit(1);
    }

    await checkDatabaseConnection();
}

main();