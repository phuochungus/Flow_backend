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
import { LyricsModule } from './lyrics/lyrics.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { YoutubeMusicService } from './youtube-music/youtube-music.service';
import { YoutubeMusicModule } from './youtube-music/youtube-music.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          url:
            config.get<string>('REDIS_INTERNAL_URL') ||
            config.get<string>('REDIS_URL') ||
            'redis://localhost:6379',
          ttl: 12 * 60 * 60 * 1000,
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
    LyricsModule,
    YoutubeMusicModule,
  ],
  controllers: [AppController],
  providers: [AppService, YoutubeMusicService],
})
export class AppModule {}
