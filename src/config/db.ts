import mysql from 'mysql2';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const envPath = path.resolve(__dirname, '../../', envFile);

dotenv.config({ 
    path: envPath,
    override: true  
});

console.log('🔧 Conectando a:', process.env.DB_NAME);
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER||'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'TeresaRides',
  port: Number(process.env.DB_PORT) || 3306,
  multipleStatements: true,
});

connection.connect((err) => {
    if(err) console.error('Error connecting to database:', err);
    else console.log('Database connection established.');
});

export default connection;