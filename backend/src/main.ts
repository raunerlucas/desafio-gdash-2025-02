import 'reflect-metadata';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security - Helmet
  app.use(helmet());

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // API Prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors();

  // Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('GDASH Weather API')
    .setDescription('API REST para sistema de coleta e visualização de dados meteorológicos')
    .setVersion('1.0')
    .addTag('auth', 'Autenticação e autorização')
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('weather', 'Dados meteorológicos')
    .addTag('pokemon', 'Integração com PokéAPI')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'GDASH Weather API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      🌤️  GDASH Weather API - NestJS Backend              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🔐 Login endpoint: http://localhost:${port}/api/auth/login`);
  console.log('');
}
bootstrap();
