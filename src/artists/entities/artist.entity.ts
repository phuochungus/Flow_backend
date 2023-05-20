import { SimplifiedAlbum } from 'src/albums/entities/album-simplofy.entity';
import { EntityType } from 'src/albums/entities/album.entity';
import { TrackSimplifyWithViewCount } from 'src/tracks/entities/track-simplify-with-view-count.entity';
import { SimplifiedArtistWithImages } from './simplified-artist-with-images.entity';
import { ImageObject } from 'src/tracks/entities/image-object.entity';

export class Artist {
  id: string;

  type: EntityType = EntityType.artist;

  name: string;

  images: ImageObject[];

  topTracks: TrackSimplifyWithViewCount[];

  albums: SimplifiedAlbum[];

  relatedArtists: SimplifiedArtistWithImages[];

  bio: { summary: string; content: string };
}
