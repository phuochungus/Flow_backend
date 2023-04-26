import { Injectable } from '@nestjs/common';
import { TracksService } from 'src/tracks/tracks.service';

@Injectable()
export class PlayerService {
  constructor(private readonly trackService: TracksService) {}
}
