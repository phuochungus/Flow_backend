import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SpotifyApiModule } from 'src/spotify-api/spotify-api.module';
import { SearchService } from './search.service';

@Module({
  imports: [SpotifyApiModule],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
