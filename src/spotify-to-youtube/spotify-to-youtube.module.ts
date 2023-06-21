import { Module } from '@nestjs/common';
import { SpotifyToYoutubeService } from './spotify-to-youtube.service';
import { YoutubeApiModule } from '../youtube-api/youtube-api.module';
import { MongooseModule } from '@nestjs/mongoose';
import SpotifyToYoutubeSchema, {
  SpotifyToYoutube,
} from './schemas/spotify-to-youtube.schema';

@Module({
  imports: [
    YoutubeApiModule,
    MongooseModule.forFeature([
      { name: SpotifyToYoutube.name, schema: SpotifyToYoutubeSchema },
    ]),
  ],
  providers: [SpotifyToYoutubeService],
  exports: [SpotifyToYoutubeService],
})
export class SpotifyToYoutubeModule {}
