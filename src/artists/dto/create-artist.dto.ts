import { IsString, IsUrl } from 'class-validator';

export class CreateArtistDto {
  @IsString()
  spotifyId: string;

  @IsString()
  name: string;

  @IsUrl()
  pictureURL: string;

  @IsString()
  description: string;
}
