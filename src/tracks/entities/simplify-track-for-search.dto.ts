import { EntityType } from '../../albums/schemas/album.schema';
import { SimplifiedTrack } from './simplified-track.dto';

export class SimplifedTrackWithPopularity extends SimplifiedTrack {
  type: EntityType = EntityType.track;
  popularity: number;
}
