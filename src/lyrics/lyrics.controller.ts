import { Controller, Get, Param } from '@nestjs/common';
import { LyricsRepository } from '../abstract/abstract';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('lyrics')
@Controller('lyrics')
export class LyricsController {
  constructor(private readonly lyricsService: LyricsRepository) {}

  @ApiTags('lyrics')
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.lyricsService.findOne(id);
  }
}
