import { Module } from '@nestjs/common';
import { SpotifyToYoutubeService } from './spotify-to-youtube.service';
import { YoutubeApiModule } from '../youtube-api/youtube-api.module';
import { MongooseModule } from '@nestjs/mongoose';
import SpotifyToYoutubeSchema, {
  SpotifyToYoutube,
} from './schemas/spotify-to-youtube.schema';
import {
  YoutubeMusicService,
  SearchMusicService,
} from '../youtube-music/youtube-music.service';
import { SpotifyApiModule } from '../spotify-api/spotify-api.module';

@Module({
  imports: [
    YoutubeApiModule,
    MongooseModule.forFeature([
      { name: SpotifyToYoutube.name, schema: SpotifyToYoutubeSchema },
    ]),
    SpotifyApiModule,
  ],
  providers: [
    SpotifyToYoutubeService,
    YoutubeMusicService,
    {
      provide: SearchMusicService,
      useExisting: YoutubeMusicService,
    },
  ],
  exports: [SpotifyToYoutubeService],
})
export class SpotifyToYoutubeModule {}
