import { ApiExtraModels, PickType } from '@nestjs/swagger';
import { Album } from '../schemas/album.schema';

export class SimplifiedAlbum extends PickType(Album, [
  'id',
  'name',
  'images',
  'type',
  'artists',
] as const) {}
