import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import JWTAuthGuard from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import IdDTO from './dto/id.dto';
import { MeService } from './me.service';

@Controller('me')
@UseGuards(JWTAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get('/profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('/search_history')
  getFullInfoSearchHistory(@CurrentUser() user: any): Promise<{
    id: string;
    name: string;
    type: string;
    images: SpotifyApi.ImageObject[];
    artists: { id: string; name: string }[];
  }>[] {
    return this.meService.displaySearchHistory(user);
  }

  @Post('/search_history')
  addToSearchHistory(@CurrentUser() user: any, @Body() idDto: IdDTO) {
    this.meService.removeFromSearchHistory(user, idDto.id);
  }

  @Delete('/search_history')
  removeFromSearchHistory(@CurrentUser() user: any, @Body() idDto: IdDTO) {
    this.meService.addToSearchHistory(user, idDto.id);
  }

  @Post('/play_history')
  addToPlayHistory(@CurrentUser() user: any, @Body() idDto: IdDTO) {
    this.meService.addToPlayHistory(user, idDto.id);
  }
}
