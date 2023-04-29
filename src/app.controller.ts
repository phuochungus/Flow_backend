import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SpotifyApiService } from './spotify-api/spotify-api.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private spotifyService: SpotifyApiService,
  ) {}

  @Get()
  getHello() {
    return 'Hello World!';
  }

  @Post()
  async protected() {
    return await this.spotifyService.requestAccessToken();
  }
}
