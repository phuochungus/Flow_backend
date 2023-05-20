import { ApiExtraModels, PickType } from '@nestjs/swagger';
import { Artist } from './artist.entity';
import { ImageObject } from 'src/tracks/entities/image-object.entity';

export class SimplifiedArtistWithImages extends PickType(Artist, [
  'id',
  'name',
  'images',
  'type',
] as const) {}
