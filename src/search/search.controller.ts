import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import QueryTrackDTO from './dto/query-track.dto';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly spotifyAPIService: SpotifyApiService,
  ) {}
  @Get()
  async find(@Query() queryTrackDto: QueryTrackDTO) {
    return await this.spotifyAPIService.searchInSpotify(
      queryTrackDto.query,
      queryTrackDto.page,
    );
  }
}
