import 'reflect-metadata';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  app.setGlobalPrefix('api');
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      🌤️  GDASH Weather API - NestJS Backend              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
  console.log(`🔐 Login endpoint: http://localhost:${port}/api/auth/login`);
  console.log('');
}
bootstrap();
