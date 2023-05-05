import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AlbumsService } from './albums.service';
import JWTAuthGuard from 'src/auth/guards/jwt.guard';
import { MarkUserFavouritesInterceptor } from 'src/interceptors/mark-user-favourites.interceptor';

@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @UseGuards(JWTAuthGuard)
  @UseInterceptors(MarkUserFavouritesInterceptor)
  @Get('/album/:id')
  async findOne(@Param('id') id: string) {
    return await this.albumsService.findOne(id);
  }
}
