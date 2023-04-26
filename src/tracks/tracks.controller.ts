import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { TracksService } from './tracks.service';

import QueryTrackDTO from './dto/query-track.dto';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import { NhaccuatuiApiService } from 'src/nhaccuatui-api/nhaccuatui-api.service';
import { createReadStream } from 'fs';
import { Response } from 'express';

@Controller('tracks')
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly spotifyApiService: SpotifyApiService,
    private readonly nhaccuatuiApiService: NhaccuatuiApiService,
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

  @Get('lyric/:id')
  async getLyric(@Param('id') id: string) {
    const { nhaccuatuiId } = await this.spotifyApiService.findOne(id);
    const file = this.nhaccuatuiApiService.getLyric(nhaccuatuiId);
    return file;
  }
}
