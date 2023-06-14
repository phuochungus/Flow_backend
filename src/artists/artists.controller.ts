import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ArtistsService } from './artists.service';
import JWTAuthGuard from 'src/auth/guards/jwt.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ArtistWithIsFavourite } from './entities/artist-with-isFavourite.entity';
import { MarkUserFavouritesInterceptor } from 'src/interceptors/mark-user-favourites.interceptor';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('artists')
@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get('/artist/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ArtistWithIsFavourite })
  @ApiParam({ name: 'id', example: '00FQb4jTyendYWaN8pK0wa' })
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(MarkUserFavouritesInterceptor)
  @UseInterceptors(CacheInterceptor)
  async getArtistInfo(@Param('id') artistId: string) {
    return await this.artistsService.getArtistInfo(artistId);
  }

  @UseInterceptors(CacheInterceptor)
  @Get('/typical_artists')
  async getTypicalArtists() {
    return await this.artistsService.getTypicalArtists();
  }
}
