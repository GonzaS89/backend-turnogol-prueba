import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db_host = process.env.DB_HOST || 'localhost';
const db_user = process.env.DB_USER;
const db_password = process.env.DB_PASSWORD;
const db_name = process.env.DB_NAME || 'canchas_db';
const db_port = process.env.DB_PORT || 3306;

const pool = mysql.createPool({
  host: db_host,
  user: db_user,
  password: db_password,
  database: db_name,
  port: db_port,
  timezone: '-03:00',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
