import { Module } from '@nestjs/common';
import { SpotifyApiService } from './spotify-api.service';

@Module({
  providers: [SpotifyApiService],
  exports: [SpotifyApiService],
})
export class SpotifyApiModule {}
