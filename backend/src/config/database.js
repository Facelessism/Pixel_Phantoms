const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD) {
    throw new Error('Database environment variables are not properly configured.');
}

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false, // Set to console.log to see SQL queries
        pool: {
            max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: process.env.DB_SSL === 'true'
            ? {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            }
            : {}
    }
);

sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully.');
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
        process.exit(1);
    });

module.exports = sequelize;
