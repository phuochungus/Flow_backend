import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ArtistsService } from './artists.service';
import JWTAuthGuard from 'src/auth/guards/jwt.guard';
import { MarkUserFollowingArtists } from 'src/interceptors/mark-user-following-artists.interceptor';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Artist } from './entities/artist.entity';
import { ArtistWithIsFavourite } from './entities/artist-with-isFavourite.entity';

@ApiTags('artists')
@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get('/artist/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ArtistWithIsFavourite })
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(MarkUserFollowingArtists)
  @ApiParam({ name: 'id', example: '00FQb4jTyendYWaN8pK0wa' })
  async getArtistInfo(@Param('id') artistId: string) {
    return await this.artistsService.getArtistInfo(artistId);
  }

  @Get('/typical_artists')
  async getTypicalArtists() {
    return await this.artistsService.getTypicalArtists();
  }
}
