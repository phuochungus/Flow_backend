import { EntityType } from 'src/albums/entities/album.entity';
import { SimplifiedTrack } from './simplified-track.dto';

export class SimplifedTrackWithPopularity extends SimplifiedTrack {
  type: EntityType = EntityType.track;
  popularity: number;
}
