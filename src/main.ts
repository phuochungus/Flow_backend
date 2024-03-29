import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AlbumsModule } from './albums/albums.module';
import { ArtistsModule } from './artists/artists.module';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { SearchModule } from './search/search.module';
import { SpotifyApiModule } from './spotify-api/spotify-api.module';
import { SpotifyToYoutubeModule } from './spotify-to-youtube/spotify-to-youtube.module';
import { TracksModule } from './tracks/tracks.module';
import { UsersModule } from './users/users.module';
import { YoutubeApiModule } from './youtube-api/youtube-api.module';
import compression from 'compression';
import { LyricsModule } from './lyrics/lyrics.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(compression());
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
  const document = SwaggerModule.createDocument(app, config, {
    include: [
      AuthModule,
      UsersModule,
      MeModule,
      SpotifyApiModule,
      TracksModule,
      AlbumsModule,
      ArtistsModule,
      SearchModule,
      YoutubeApiModule,
      SpotifyToYoutubeModule,
      LyricsModule,
    ],
  });
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
