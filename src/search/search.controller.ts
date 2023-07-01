import { Controller, Get, Query } from '@nestjs/common';
import { QueryTrackDTO } from './dto/query-track.dto';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from '../abstract/abstract';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async find(@Query() queryTrackDto: QueryTrackDTO) {
    return await this.searchService.search(
      queryTrackDto.query,
      queryTrackDto.page,
    );
  }
}
