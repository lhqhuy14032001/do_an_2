const mysql = require('mysql2');
require('dotenv').config();
const configs = {
    host: process.env.HOST,
    user: process.env.USER,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    password: process.env.PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0

}
const connection = mysql.createPool(configs);




module.exports = connection;