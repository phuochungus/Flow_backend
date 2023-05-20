import { PickType } from '@nestjs/swagger';
import { Artist } from './artist.entity';

export class SimplifiedArtist extends PickType(Artist, [
  'id',
  'name',
] as const) {}
