import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import JWTAuthGuard from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { MeService } from 'src/me/me.service';

@Controller('me')
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @ApiTags('profile')
  @Get('/profile')
  getProfile(@CurrentUser() user: any) {
    return user;
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
        id: '0B1ZnYwYefkNhZeE8ZQpv5',
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
        id: '0B1ZnYwYefkNhZeE8ZQpv5',
      },
    },
  })
  removeFromFavourites(@CurrentUser() user: any, @Body('id') id: string) {
    this.meService.removeFromFavourite(user, id);
  }

  @ApiTags('favourite (album, track and artist)')
  @Get('/favourites')
  getFavourites(@CurrentUser() user: any): string[] {
    return user.favourites;
  }
}
