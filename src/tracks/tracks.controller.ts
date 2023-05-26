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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiParam,
  ApiProduces,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { Track, TrackWithIsFavourite } from './entities/track.entity';
import { Lyrics, responseLyricArray } from './entities/lyrics.entity';
@ApiTags('tracks')
@Controller('tracks')
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly spotifyApiService: SpotifyApiService,
  ) {}

  @Get('/track/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: TrackWithIsFavourite })
  @ApiParam({ name: 'id', example: '3zhbXKFjUDw40pTYyCgt1Y' })
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(MarkUserFavouritesInterceptor)
  async findOne(@Param('id') id: string): Promise<Track> {
    return await this.tracksService.getInfo(id);
  }

  @Get('/play/:id')
  @ApiParam({ name: 'id', example: '3zhbXKFjUDw40pTYyCgt1Y' })
  @ApiOperation({ summary: 'an audio streaming API' })
  @ApiOkResponse({
    description: 'a audio file',
    content: {
      'audio/ogg': {},
    },
    headers: {
      'Transfer-Encoding': {
        schema: {
          type: 'string',
        },
        description: 'chunked',
      },
    },
  })
  async playTrack(@Res() res: Response, @Param('id') id: string) {
    return await this.tracksService.play(id, res);
  }

  @Get('lyrics/:id')
  @ApiParam({ name: 'id', example: '3zhbXKFjUDw40pTYyCgt1Y' })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        properties: {
          startTimeMs: { type: 'integer' },
          words: { type: 'string' },
        },
      },
      example: responseLyricArray,
    },
  })
  async getLyric(@Param('id') id: string): Promise<Lyrics[]> {
    return await this.spotifyApiService.getLyric(id);
  }

  @Get('/top50')
  @ApiOkResponse({
    type: [Track],
  })
  async getTop50SongFromVietNam(): Promise<Track[]> {
    return await this.tracksService.getTop50TracksVietnam();
  }

  @Get('/explore')
  @ApiOkResponse({
    type: [Track],
    description: 'not implemented, waiting for list of genre',
  })
  async getTrackByGenre(@Body() explorePlaylistTrack: ExplorePlaylistTrackDTO) {
    return await this.tracksService.playPlaylist(
      explorePlaylistTrack.genreName,
    );
  }
}
