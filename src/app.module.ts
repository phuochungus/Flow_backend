import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MeModule } from './me/me.module';
import { SpotifyApiModule } from './spotify-api/spotify-api.module';
import { TracksModule } from './tracks/tracks.module';
import { AlbumsModule } from './albums/albums.module';
import { ArtistsModule } from './artists/artists.module';
import { SearchModule } from './search/search.module';
import { YoutubeApiModule } from './youtube-api/youtube-api.module';
import { SpotifyToYoutubeModule } from './spotify-to-youtube/spotify-to-youtube.module';
import { SeminarModule } from './seminar/seminar.module';
import { LyricsModule } from './lyrics/lyrics.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule.forRoot()],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          url: config.get<string>(process.env.REDIS_URL || 'localhost:6379'),
        }),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL || 'localhost:27017', {
      autoIndex: true,
    }),
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
    SeminarModule,
    LyricsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
