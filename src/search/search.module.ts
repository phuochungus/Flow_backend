import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SpotifyApiModule } from 'src/spotify-api/spotify-api.module';
import { SpotifySearchService } from './search.service';
import { SearchService } from '../abstract/abstract';

@Module({
  imports: [SpotifyApiModule],
  controllers: [SearchController],
  providers: [
    {
      provide: SearchService,
      useClass: SpotifySearchService,
    },
  ],
})
export class SearchModule {}
