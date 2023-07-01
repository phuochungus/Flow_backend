import {
  Controller,
  Get,
  Inject,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AlbumRepository, SpotifyAlbumRepository } from './albums.service';
import JWTAuthGuard from 'src/auth/guards/jwt.guard';
import { MarkUserFavouritesInterceptor } from 'src/interceptors/mark-favourites.interceptor';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Album } from './schemas/album.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@ApiTags('albums')
@Controller('albums')
export class AlbumsController {
  constructor(
    private readonly albumRepository: AlbumRepository,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  @Get('/album/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: Album })
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(MarkUserFavouritesInterceptor)
  async findOne(@Param('id') id: string) {
    const albumInfo: Album | undefined = await this.cacheManager.get(
      `album_${id}`,
    );
    if (albumInfo) return albumInfo;
    else {
      const album = await this.albumRepository.findOne(id);
      this.cacheManager.set(`album_${id}`, album);
      return album;
    }
  }
}
