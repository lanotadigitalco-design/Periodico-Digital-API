import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { seedRoles } from './seed-roles';

// Entidades
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { InformacionUsuario } from '../entities/informacion-usuario.entity';
import { Articulo } from '../entities/articulo.entity';
import { Comentario } from '../entities/comentario.entity';
import { LogVisualizacionArticulo } from '../entities/log-visualizacion-articulo.entity';
import { LogVisualizacionSitio } from '../entities/log-visualizacion-sitio.entity';

config();

const configService = new ConfigService();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT'),
  username: configService.get<string>('DATABASE_USER'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_NAME'),
  entities: [
    Usuario,
    Rol,
    InformacionUsuario,
    Articulo,
    Comentario,
    LogVisualizacionArticulo,
    LogVisualizacionSitio,
  ],
  synchronize: false,
});

async function runSeed() {
  try {
    await AppDataSource.initialize();
    console.log('📦 Conexión a la base de datos establecida');

    await seedRoles(AppDataSource);

    console.log('✅ Seed completado exitosamente');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error ejecutando seed:', error);
    process.exit(1);
  }
}

runSeed();
