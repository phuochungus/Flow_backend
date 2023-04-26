import { IsNumber, IsString, Min } from 'class-validator';

export default class QueryTrackDTO {
  @IsString()
  query: string;

  @IsNumber()
  @Min(0)
  page: number = 0;
}
