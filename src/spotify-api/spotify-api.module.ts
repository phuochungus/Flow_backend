import { Module } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import { SpotifyApiService } from './spotify-api.service';

@Module({
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
