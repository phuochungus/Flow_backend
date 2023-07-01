import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import JWTAuthGuard from 'src/auth/guards/jwt.guard';
import { MarkUserFavouritesInterceptor } from 'src/interceptors/mark-favourites.interceptor';
import ExplorePlaylistTrackDTO from './dto/explore-playlist-track.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiParam,
  ApiOperation,
} from '@nestjs/swagger';
import { Track, TrackWithIsFavourite } from './entities/track.entity';
import { TrackRepository } from '../abstract/abstract';

@ApiTags('tracks')
@Controller('tracks')
export class TracksController {
  constructor(private readonly trackRepository: TrackRepository) {}

  @Get('/track/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: TrackWithIsFavourite })
  @ApiParam({ name: 'id', example: '3zhbXKFjUDw40pTYyCgt1Y' })
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(MarkUserFavouritesInterceptor)
  async findOne(@Param('id') id: string): Promise<Track> {
    return await this.trackRepository.getMetadata(id);
  }

  @Get('v2/play/:id')
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
    return await this.trackRepository.getAudioContent(id, res);
  }

  @Get('/top50')
  @ApiOkResponse({
    type: [Track],
  })
  async getTop50(): Promise<Track[]> {
    return await this.trackRepository.getTop50();
  }

  @Get('/explore')
  @ApiOkResponse({
    type: [Track],
  })
  async getTrackByGenre(
    @Query() explorePlaylistTrack: ExplorePlaylistTrackDTO,
  ) {
    return await this.trackRepository.getExploreTrack(
      explorePlaylistTrack.playlistName,
    );
  }
}
