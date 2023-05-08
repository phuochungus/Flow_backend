import { IsString } from 'class-validator';

export default class ExplorePlaylistTrackDTO {
  @IsString()
  genreName: string;
}
