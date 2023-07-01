import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SpotifyApiModule } from 'src/spotify-api/spotify-api.module';
import { SearchService, SpotifySearchService } from './search.service';

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
