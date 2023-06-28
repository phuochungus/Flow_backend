import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { LyricsService } from './lyrics.service';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('lyrics')
export class LyricsController {
  constructor(private readonly lyricsService: LyricsService) {}


  ///TODO: REMOVE interceptor, manually cache response with following order: cache -> database -> API
  @UseInterceptors(CacheInterceptor)
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.lyricsService.findOne(id);
  }
}
