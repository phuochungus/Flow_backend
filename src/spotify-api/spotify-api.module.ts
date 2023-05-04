import { Module } from '@nestjs/common';
import { SpotifyApiService } from './spotify-api.service';
import { YoutubeApiModule } from 'src/youtube-api/youtube-api.module';
import { SpotifyToYoutubeModule } from 'src/spotify-to-youtube/spotify-to-youtube.module';

@Module({
  imports: [YoutubeApiModule, SpotifyToYoutubeModule],
  providers: [SpotifyApiService],
  exports: [SpotifyApiService],
})
export class SpotifyApiModule {}
