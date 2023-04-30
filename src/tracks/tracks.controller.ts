import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import { Response } from 'express';

@Controller('tracks')
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly spotifyApiService: SpotifyApiService,
  ) {}

  @Get('/track/:id')
  async findOne(@Param('id') id: string) {
    return await this.spotifyApiService.findOne(id);
  }

  @Get('/play/:id')
  async playTrack(@Res() res: Response, @Param('id') id: string) {
    return await this.tracksService.play(id, res);
  }

  // @Get('lyric/:id')
  // async getLyric(@Param('id') id: string) {
  //   const { nhaccuatuiId } = await this.spotifyApiService.findOne(id);
  //   const file = this.nhaccuatuiApiService.getLyricById(nhaccuatuiId);
  //   return file;
  // }
}
