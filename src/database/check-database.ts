import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkAndCreateDatabase() {
  const dbName = process.env.DATABASE_NAME || 'noticias_db';

  // Conectar a PostgreSQL sin especificar base de datos (conecta a 'postgres')
  const connectionSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    database: 'postgres', // Conectar a la base de datos por defecto
  });

  try {
    await connectionSource.initialize();
    console.log('✓ Conectado a PostgreSQL');

    // Verificar si la base de datos existe
    const result = await connectionSource.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );

    if (result.length === 0) {
      // Crear la base de datos si no existe
      console.log(`⚙ Creando base de datos "${dbName}"...`);
      await connectionSource.query(`CREATE DATABASE ${dbName}`);
      console.log(`✓ Base de datos "${dbName}" creada exitosamente`);
    } else {
      console.log(`✓ La base de datos "${dbName}" ya existe`);
    }

    await connectionSource.destroy();
  } catch (error) {
    console.error(
      '✗ Error al verificar/crear la base de datos:',
      error.message,
    );
    process.exit(1);
  }
}

checkAndCreateDatabase();
