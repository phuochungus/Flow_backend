import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { MeService } from './me.service';
import JWTAuthGuard from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { TracksService } from 'src/tracks/tracks.service';

@Controller('me')
@UseGuards(JWTAuthGuard)
export class MeController {
  constructor(
    private readonly meService: MeService,
    private readonly tracksService: TracksService,
  ) {}

  @Get('/profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('/play/:id')
  async playTrack(
    @Res() response: any,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    await this.meService.playTrack(user, id, response);
  }
}
