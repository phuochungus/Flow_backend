import { Module } from '@nestjs/common';
import { SpotifyApiService } from './spotify-api.service';
import { YoutubeApiModule } from 'src/youtube-api/youtube-api.module';
import { SpotifyToYoutubeModule } from 'src/spotify-to-youtube/spotify-to-youtube.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [YoutubeApiModule, SpotifyToYoutubeModule, HttpModule],
  providers: [SpotifyApiService],
  exports: [SpotifyApiService],
})
export class SpotifyApiModule {}
