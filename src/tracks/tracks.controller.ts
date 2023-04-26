import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import QueryTrackDTO from './dto/query-track.dto';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Post()
  find(@Body() queryTrackDto: QueryTrackDTO) {
    return this.tracksService.findOneOrCreateIfNotExist(queryTrackDto);
  }
}
