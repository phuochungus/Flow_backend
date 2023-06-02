import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URL, { autoIndex: true }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
