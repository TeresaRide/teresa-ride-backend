import dotenv from 'dotenv';
import path from 'path';

// Cargar .env.test si NODE_ENV es test
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const envPath = path.resolve(__dirname, '../', envFile);

dotenv.config({ 
    path: envPath,
    override: true  
});

console.log(' Usando archivo:', envFile);
console.log(' NODE_ENV:', process.env.NODE_ENV);

import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});