import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SeminarModule } from './seminar/seminar.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Flow APIs')
    .setDescription('The Flow API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addOAuth2(
      {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl:
              (process.env.HEROKU_APP_URL || 'http://localhost:3000') +
              '/auth/google',
            scopes: {
              email: 'read your mail',
              profile: 'read your profile',
            },
          },
        },
      },
      'google',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const config2 = new DocumentBuilder()
    .setTitle('Seminar APIs')
    .setDescription('The API to seminar')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document2 = SwaggerModule.createDocument(app, config2, {
    include: [SeminarModule],
  });
  SwaggerModule.setup('api2', app, document2);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
