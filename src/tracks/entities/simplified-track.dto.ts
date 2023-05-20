import { ApiExtraModels, PickType } from '@nestjs/swagger';
import { Track } from './track.entity';

export class SimplifiedTrack extends PickType(Track, [
  'id',
  'name',
  'artists',
  'images',
  'type',
] as const) {}
