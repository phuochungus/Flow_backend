import { SimplifiedArtist } from './simplified-artist.entity';
import { EntityType } from '../../albums/schemas/album.schema';
import { ImageObject } from '../../tracks/entities/image-object.entity';

export class SimplifiedArtistWithPopulary extends SimplifiedArtist {
  type: EntityType = EntityType.artist;
  images: ImageObject[];
  popularity: number;
}
