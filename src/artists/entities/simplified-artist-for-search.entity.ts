import { EntityType } from 'src/albums/entities/album.entity';
import { ImageObject } from 'src/tracks/entities/image-object.entity';
import { SimplifiedArtist } from './simplified-artist.entity';

export class SimplifiedArtistWithPopulary extends SimplifiedArtist {
  type: EntityType = EntityType.artist;
  images: ImageObject[];
  popularity: number;
}
