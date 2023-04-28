import { Controller, Get, Param, Res } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';

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
  async playTrack(@Res() response, @Param('id') id: string) {
    await this.tracksService.play(id, response);
  }

  // @Get('lyric/:id')
  // async getLyric(@Param('id') id: string) {
  //   const { nhaccuatuiId } = await this.spotifyApiService.findOne(id);
  //   const file = this.nhaccuatuiApiService.getLyricById(nhaccuatuiId);
  //   return file;
  // }
}
