import {
  Body,
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TracksService } from './tracks.service';
import { Response } from 'express';
import JWTAuthGuard from 'src/auth/guards/jwt.guard';
import { MarkUserFavouritesInterceptor } from 'src/interceptors/mark-user-favourites.interceptor';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import ExplorePlaylistTrackDTO from './dto/explore-playlist-track.dto';

@Controller('tracks')
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly spotifyApiService: SpotifyApiService,
  ) {}

  @Get('/track/:id')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(MarkUserFavouritesInterceptor)
  async findOne(@Param('id') id: string) {
    return await this.tracksService.getInfo(id);
  }

  @Get('/play/:id')
  async playTrack(@Res() res: Response, @Param('id') id: string) {
    return await this.tracksService.play(id, res);
  }

  @Get('lyrics/:id')
  async getLyric(@Param('id') id: string) {
    return await this.spotifyApiService.getLyric(id);
  }

  @Get('/top50')
  async getTop50SongFromVietNam() {
    return await this.tracksService.getTop50TracksVietnam();
  }

  @Get('/explore')
  async getTrackByGenre(@Body() explorePlaylistTrack: ExplorePlaylistTrackDTO) {
    return await this.tracksService.playPlaylist(
      explorePlaylistTrack.genreName,
    );
  }
}
