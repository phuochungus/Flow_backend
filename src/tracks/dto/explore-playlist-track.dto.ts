import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export default class ExplorePlaylistTrackDTO {
  @ApiProperty({ example: 'Pop' })
  @IsString()
  genreName: string;
}
