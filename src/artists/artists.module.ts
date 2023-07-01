import { Module } from '@nestjs/common';
import { ArtistRepository, SpotifyArtistRepository } from './artists.service';
import { ArtistsController } from './artists.controller';
import { SpotifyApiModule } from 'src/spotify-api/spotify-api.module';
import { YoutubeApiModule } from '../youtube-api/youtube-api.module';
import { SpotifyToYoutubeModule } from '../spotify-to-youtube/spotify-to-youtube.module';

@Module({
  imports: [SpotifyApiModule, YoutubeApiModule, SpotifyToYoutubeModule],
  controllers: [ArtistsController],
  providers: [
    {
      provide: ArtistRepository,
      useClass: SpotifyArtistRepository,
    },
  ],
  exports: [ArtistRepository],
})
export class ArtistsModule {}
