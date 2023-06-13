import { Controller, Get, Param } from '@nestjs/common';
import { LyricsService } from './lyrics.service';

@Controller('lyrics')
export class LyricsController {
  constructor(private readonly lyricsService: LyricsService) {}

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.lyricsService.findOne(id);
  }
}
