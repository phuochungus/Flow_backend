import { Module } from '@nestjs/common';
import { SpotifyToYoutubeService } from './spotify-to-youtube.service';
import { YoutubeApiModule } from '../youtube-api/youtube-api.module';
import { MongooseModule } from '@nestjs/mongoose';
import SpotifyToYoutubeSchema, {
  SpotifyToYoutube,
} from './schemas/spotify-to-youtube.schema';
import {
  YoutubeMusicService,
  ISearchMusicToken,
} from '../youtube-music/youtube-music.service';

@Module({
  imports: [
    YoutubeApiModule,
    MongooseModule.forFeature([
      { name: SpotifyToYoutube.name, schema: SpotifyToYoutubeSchema },
    ]),
  ],
  providers: [
    SpotifyToYoutubeService,
    YoutubeMusicService,
    {
      provide: ISearchMusicToken,
      useExisting: YoutubeMusicService,
    },
  ],
  exports: [SpotifyToYoutubeService],
})
export class SpotifyToYoutubeModule {}
