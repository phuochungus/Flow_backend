import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import JWTAuthGuard from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { MeService, SimplifiedItem } from './me.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { PushHistoryDTO } from './dto/PushHistory.dto';
import { SimplifiedArtistWithImages } from 'src/artists/entities/simplified-artist-with-images.entity';
import { SimplifiedAlbum } from 'src/albums/entities/album-simplofy.entity';
import { SimplifiedTrack } from 'src/tracks/entities/simplified-track.dto';

@Controller('me')
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get('/profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('/search_history')
  @ApiTags('search history')
  @ApiExtraModels(SimplifiedTrack, SimplifiedArtistWithImages, SimplifiedAlbum)
  @ApiResponse({
    status: 200,
    schema: {
      type: 'array',
      items: {
        anyOf: [
          { $ref: getSchemaPath(SimplifiedTrack) },
          { $ref: getSchemaPath(SimplifiedArtistWithImages) },
          { $ref: getSchemaPath(SimplifiedAlbum) },
        ],
      },
    },
  })
  async displaySearchHistory(
    @CurrentUser() user: any,
  ): Promise<SimplifiedItem[]> {
    return await this.meService.displaySearchHistory(user);
  }

  @Post('/search_history')
  @ApiTags('search history')
  addToSearchHistory(
    @CurrentUser() user: any,
    @Body() pushHistoryDto: PushHistoryDTO,
  ) {
    this.meService.addToSearchHistory(user, pushHistoryDto);
  }

  @Delete('/search_history')
  @ApiTags('search history')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
    },
  })
  removeFromSearchHistory(@CurrentUser() user: any, @Body('id') id: string) {
    this.meService.removeFromSearchHistory(user, id);
  }

  @Get('/play_history')
  @ApiTags('play history')
  async displayPlayHistory(@CurrentUser() user: any) {
    return await this.meService.displayPlayHistory(user);
  }

  @ApiTags('play history')
  @Post('/play_history')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
    },
  })
  addToPlayHistory(@CurrentUser() user: any, @Body('id') id: string) {
    this.meService.addToPlayHistory(user, id);
  }
  @ApiTags('artist favourite')
  @Post('/follow_artist')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
    },
  })
  addToFollowingArtists(@CurrentUser() user: any, @Body('id') id: string) {
    this.meService.addToFavourite(user, id);
  }

  @ApiTags('artist favourite')
  @Delete('/unfollow_artist')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
    },
  })
  removeFromFollowingArtists(@CurrentUser() user: any, @Body('id') id: string) {
    this.meService.removeFromFavourite(user, id);
  }

  @ApiTags('favourite (album, track and artist)')
  @Post('/favourites')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      example: {
        id: '3zhbXKFjUDw40pTYyCgt1Y',
      },
    },
  })
  addToFavourites(@CurrentUser() user: any, @Body('id') id: string) {
    this.meService.addToFavourite(user, id);
  }

  @ApiTags('favourite (album, track and artist)')
  @Delete('/favourites')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      example: {
        id: '3zhbXKFjUDw40pTYyCgt1Y',
      },
    },
  })
  removeFromFavourites(@CurrentUser() user: any, @Body('id') id: string) {
    this.meService.removeFromFavourite(user, id);
  }

  @ApiTags('favourite (album and track)')
  @Get('/favourites')
  getFavourites(@CurrentUser() user: any): string[] {
    return user.favourites;
  }
}
