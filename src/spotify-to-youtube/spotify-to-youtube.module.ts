import { Module } from '@nestjs/common';
import { SpotifyToYoutubeService } from './spotify-to-youtube.service';
import { SpotifyApiModule } from 'src/spotify-api/spotify-api.module';

@Module({
  providers: [SpotifyToYoutubeService],
  exports: [SpotifyToYoutubeService],
})
export class SpotifyToYoutubeModule {}
