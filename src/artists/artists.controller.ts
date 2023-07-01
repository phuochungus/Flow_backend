import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  UseGuards,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import JWTAuthGuard from 'src/auth/guards/jwt.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ArtistWithIsFavourite } from './entities/artist-with-isFavourite.entity';
import { MarkUserFavouritesInterceptor } from 'src/interceptors/mark-favourites.interceptor';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Artist } from './entities/artist.entity';
import { ArtistRepository } from '../abstract/abstract';

@ApiTags('artists')
@Controller('artists')
export class ArtistsController {
  constructor(
    private readonly artistRepository: ArtistRepository,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  @Get('/artist/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ArtistWithIsFavourite })
  @ApiParam({ name: 'id', example: '00FQb4jTyendYWaN8pK0wa' })
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(MarkUserFavouritesInterceptor)
  async getArtistInfo(@Param('id') artistId: string) {
    const artistsInfo: Artist | undefined = await this.cacheManager.get(
      `/artists/artist/${artistId}`,
    );
    if (artistsInfo) return artistsInfo;
    else {
      const res = await this.artistRepository.findOne(artistId);
      this.cacheManager.set(`/artists/artist/${artistId}`, res);
      return res;
    }
  }

  @Get('v2/artist/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ArtistWithIsFavourite })
  @ApiParam({ name: 'id', example: '00FQb4jTyendYWaN8pK0wa' })
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(MarkUserFavouritesInterceptor)
  async getArtistInfoV2(@Param('id') artistId: string) {
    const res = await this.artistRepository.findOne(artistId);
    if (res) return res;
    throw new NotFoundException('Artist not found');
  }

  @Get('/typical_artists')
  async getTypicalArtists() {
    return await this.artistRepository.findTopArtists();
  }
}
