import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SpotifyApiModule } from 'src/spotify-api/spotify-api.module';

@Module({
  imports: [SpotifyApiModule],
  controllers: [SearchController],
})
export class SearchModule {}
