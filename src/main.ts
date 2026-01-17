import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Habilitar CORS con credenciales
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'ngrok-skip-browser-warning',
    ],
    exposedHeaders: ['Authorization'],
  });

  // Habilitar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('API de Noticias')
    .setDescription(
      'API REST completa para gestión de noticias con autenticación JWT, roles de usuario, artículos, comentarios y logs de visualización',
    )
    .setVersion('1.0')
    .addTag('Autenticación', 'Endpoints para registro e inicio de sesión')
    .addTag('Usuarios', 'Gestión de usuarios (solo administradores)')
    .addTag('Artículos', 'CRUD de artículos y búsqueda')
    .addTag('Comentarios', 'Gestión de comentarios con respuestas anidadas')
    .addTag('Logs', 'Logs públicos de visualizaciones')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa el token JWT obtenido al iniciar sesión',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Montar la documentación Swagger en /api/docs
  SwaggerModule.setup('api/docs', app, document);

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}/api`);
  console.log(
    `📚 Documentación Swagger disponible en: http://localhost:${port}/api/docs`,
  );
}
bootstrap();
