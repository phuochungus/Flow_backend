import { Controller, Get, Query } from '@nestjs/common';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import {QueryTrackDTO} from './dto/query-track.dto';
import { ApiTags } from '@nestjs/swagger';

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
