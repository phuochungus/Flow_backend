import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import { QueryTrackDTO } from './dto/query-track.dto';
import { ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly spotifyAPIService: SpotifyApiService) {}
  
  @UseInterceptors(CacheInterceptor)
  @Get()
  async find(@Query() queryTrackDto: QueryTrackDTO) {
    return await this.spotifyAPIService.searchInSpotify(
      queryTrackDto.query,
      queryTrackDto.page,
    );
  }
}
