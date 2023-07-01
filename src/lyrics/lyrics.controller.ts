import { Controller, Get, Param } from '@nestjs/common';
import { LyricsRepository } from '../abstract/abstract';

@Controller('lyrics')
export class LyricsController {
  constructor(private readonly lyricsService: LyricsRepository) {}

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.lyricsService.findOne(id);
  }
}
