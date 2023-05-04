import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { SpotifyApiModule } from 'src/spotify-api/spotify-api.module';
import { YoutubeApiModule } from 'src/youtube-api/youtube-api.module';
import { SpotifyToYoutubeModule } from 'src/spotify-to-youtube/spotify-to-youtube.module';

@Module({
  imports: [SpotifyApiModule, YoutubeApiModule, SpotifyToYoutubeModule],
  controllers: [TracksController],
  providers: [TracksService],
  exports: [TracksService],
})
export class TracksModule {}
