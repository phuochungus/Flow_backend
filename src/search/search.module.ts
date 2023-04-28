import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SpotifyApiModule } from 'src/spotify-api/spotify-api.module';

@Module({
  imports: [SpotifyApiModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
