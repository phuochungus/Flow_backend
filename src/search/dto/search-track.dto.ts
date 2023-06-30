import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { SimplifiedAlbumWithPopularity } from 'src/albums/entities/simplified-album-for-search.dto';
import { SimplifiedArtistWithPopulary } from 'src/artists/entities/simplified-artist-for-search.entity';
import { SimplifedTrackWithPopularity } from 'src/tracks/entities/simplify-track-for-search.dto';
import { SimplifiedEntity } from '../search.service';

export class SearchResult {
  @ApiProperty({
    type: 'array',
    items: {
      anyOf: [
        { $ref: getSchemaPath(SimplifedTrackWithPopularity) },
        { $ref: getSchemaPath(SimplifiedArtistWithPopulary) },
        { $ref: getSchemaPath(SimplifiedAlbumWithPopularity) },
      ],
    },
  })
  mostRelevant: SimplifiedEntity[];
  albums: SimplifiedAlbumWithPopularity[];
  tracks: SimplifedTrackWithPopularity[];
  artists: SimplifiedArtistWithPopulary[];
}
