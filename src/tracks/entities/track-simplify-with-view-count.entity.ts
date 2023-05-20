import { ApiProperty, PickType } from '@nestjs/swagger';
import { Track } from './track.entity';

export class TrackSimplifyWithViewCount extends PickType(Track, [
  'id',
  'name',
  'artists',
  'images',
] as const) {
  viewCount: number;
}
