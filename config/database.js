const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST_PROD,
  user: process.env.DB_USER_PROD,
  password: process.env.DB_PASSWORD_PROD,
  database: process.env.DB_NAME_PROD,
  port: process.env.DB_PORT_PROD || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;
