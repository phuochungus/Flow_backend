import { IsString } from 'class-validator';

export default class QueryTrackDTO {
  @IsString()
  searchString: string;
}
