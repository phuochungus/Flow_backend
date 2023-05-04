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

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get('/artist/:id')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(MarkUserFollowingArtists)
  async getArtistInfo(@Param('id') artistId: string) {
    return await this.artistsService.getArtistInfo(artistId);
  }

  @Get('/typical_artists')
  async getTypicalArtists() {
    return await this.artistsService.getTypicalArtists();
  }
}
