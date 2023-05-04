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
  async getFullInfoSearchHistory(@CurrentUser() user: any) {
    return await this.meService.displaySearchHistory(user);
  }

  @Post('/search_history')
  async addToSearchHistory(@CurrentUser() user: any, @Body() idDto: IdDTO) {
    await this.meService.removeFromSearchHistory(user, idDto.id);
  }

  @Delete('/search_history')
  async removeFromSearchHistory(
    @CurrentUser() user: any,
    @Body() idDto: IdDTO,
  ) {
    await this.meService.addToSearchHistory(user, idDto.id);
  }

  @Get('/play_history')
  async getFullInfoPlayHistory(@CurrentUser() user: any) {
    return await this.meService.displayPlayHistory(user);
  }

  @Post('/play_history')
  async addToPlayHistory(@CurrentUser() user: any, @Body() idDto: IdDTO) {
    await this.meService.addToPlayHistory(user, idDto.id);
  }

  @Post('/follow_artist')
  async addToFollowingArtists(@CurrentUser() user: any, @Body() idDto: IdDTO) {
    await this.meService.followArtist(user, idDto.id);
  }

  @Delete('/unfollow_artist')
  async removeFromFollowingArtists(
    @CurrentUser() user: any,
    @Body() idDto: IdDTO,
  ) {
    await this.meService.unfollowArtist(user, idDto.id);
  }
}
