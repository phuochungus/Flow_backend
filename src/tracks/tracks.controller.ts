import { Controller, Get, Param, Query } from '@nestjs/common';
import { TracksService } from './tracks.service';
import QueryTrackDTO from './dto/query-track.dto';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';

@Controller('tracks')
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly spotifyApiService: SpotifyApiService,
  ) {}

  @Get()
  find(@Query() queryTrackDto: QueryTrackDTO) {
    return this.spotifyApiService.searchInSpotify(
      queryTrackDto.query,
      queryTrackDto.page,
    );
  }

  @Get('/track/:id')
  async findOne(@Param('id') id: string) {
    return await this.spotifyApiService.findOne(id);
  }
}
