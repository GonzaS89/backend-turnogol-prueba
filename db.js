import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db_host = process.env.DB_HOST || 'localhost';
const db_user = process.env.DB_USER   
const db_password = process.env.DB_PASSWORD
const db_name = process.env.DB_NAME || 'canchas_db';
const db_port = process.env.DB_PORT || 3306;


const db = await mysql.createConnection({
  host: db_host,
  user: db_user,  
  password: db_password,
  database: db_name,
  port: db_port,
  // Configuración de zona horaria para Argentina
  timezone: '-03:00' // Offset fijo para Argentina (UTC-3)
  
});

try {
  await db.connect();
  // Configurar la zona horaria explícitamente (seguridad adicional)
  await db.execute("SET time_zone = '-03:00'")
  console.log('DB conectada con éxito. Zona horaria configurada: Argentina');
} catch (error) {
  console.error('Error al conectar la DB:', error.message);
}

export default db;
