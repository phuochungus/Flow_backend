import { Module } from '@nestjs/common';
import { SpotifyToYoutubeService } from './spotify-to-youtube.service';
import { YoutubeApiModule } from '../youtube-api/youtube-api.module';

@Module({
  imports: [YoutubeApiModule],
  providers: [SpotifyToYoutubeService],
  exports: [SpotifyToYoutubeService],
})
export class SpotifyToYoutubeModule {}
