import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MeService } from './me.service';
import JWTAuthGuard from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { PlayerService } from 'src/player/player.service';
import QueryTrackDTO from 'src/tracks/dto/query-track.dto';

@Controller('me')
@UseGuards(JWTAuthGuard)
export class MeController {
  constructor(
    private readonly meService: MeService,
    private readonly playerService: PlayerService,
  ) {}

  @Get('/profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Post('/play')
  playTracks(@CurrentUser() user: any, @Body() queryTrackDto: QueryTrackDTO) {
    // this.playerService.playTrack(user, queryTrackDto);
  }
}
