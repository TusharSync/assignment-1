import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './response.interceptor';
import basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply global interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());
  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:4200', // Your React app's URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Accept',
    credentials: true, // Allow cookies or authentication headers
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  // Swagger setup
  // Protect the Swagger route with basic authentication
  app.use(
    '/api-docs',
    basicAuth({
      users: {
        [process.env.SWAGGER_USER ?? 'admin']:
          process.env.SWAGGER_PASS ?? 'admin',
      }, // Replace with your username and password
      challenge: true, // Enables browser's built-in login prompt
    })
  );

  const config = new DocumentBuilder()
    .setTitle('real-estate API Documentation')
    .setDescription('Automatically generated API documentation')
    .setVersion('1.0')
    .addBearerAuth() // Optional: Add JWT or Bearer token support
    // .addServer(`/${globalPrefix}`) // Add base URL to Swagger  
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
