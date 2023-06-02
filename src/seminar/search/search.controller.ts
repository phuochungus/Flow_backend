import { Controller, Get, Query } from '@nestjs/common';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';

import { ApiTags } from '@nestjs/swagger';
import { QueryTrackDTO } from 'src/search/dto/query-track.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly spotifyAPIService: SpotifyApiService) {}
  @Get()
  async find(@Query() queryTrackDto: QueryTrackDTO) {
    return await this.spotifyAPIService.searchInSpotify(
      queryTrackDto.query,
      queryTrackDto.page,
    );
  }
}
