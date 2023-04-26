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
import { PlayerService } from './player/player.service';
import { PlayerModule } from './player/player.module';

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
    PlayerModule,
  ],
  controllers: [AppController],
  providers: [AppService, PlayerService],
})
export class AppModule {}
