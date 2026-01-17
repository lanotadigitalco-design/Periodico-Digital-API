import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ArticulosModule } from './articulos/articulos.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { LiveStreamModule } from './live-stream/live-stream.module';
/* import { LogsModule } from './logs/logs.module'; */

// Entidades
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { InformacionUsuario } from './entities/informacion-usuario.entity';
import { Articulo } from './entities/articulo.entity';
import { Comentario } from './entities/comentario.entity';
import { LogVisualizacionArticulo } from './entities/log-visualizacion-articulo.entity';
import { LogVisualizacionSitio } from './entities/log-visualizacion-sitio.entity';
import { LiveStream } from './entities/live-stream.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
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
          LiveStream,
        ],
        synchronize: false,
        logging: false,
      }),
    }),
    AuthModule,
    UsuariosModule,
    ArticulosModule,
    LiveStreamModule,
    /* LogsModule, */
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    /* consumer.apply(LoggerMiddleware).forRoutes('*'); */
  }
}
