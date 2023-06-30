import { Module } from '@nestjs/common';
import { SpotifyApiService } from './spotify-api.service';
import { SpotifyToYoutubeModule } from 'src/spotify-to-youtube/spotify-to-youtube.module';
import SpotifyWebApi from 'spotify-web-api-node';

@Module({
  imports: [SpotifyToYoutubeModule],
  providers: [
    SpotifyApiService,
    {
      provide: SpotifyWebApi,
      useValue: new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
    },
  ],
  exports: [SpotifyApiService],
})
export class SpotifyApiModule {}
