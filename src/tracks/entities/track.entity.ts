import { EntityType } from 'src/albums/entities/album.entity';
import { SimplifiedArtist } from 'src/artists/entities/simplified-artist.entity';
import { ImageObject } from './image-object.entity';

export class Track {
  id: string;

  name: string;

  type: EntityType = EntityType.track;

  duration_ms: number;

  images: ImageObject[];

  artists: SimplifiedArtist[];
}

export class TrackWithIsFavourite extends Track {
  isFavourite: boolean;
}
