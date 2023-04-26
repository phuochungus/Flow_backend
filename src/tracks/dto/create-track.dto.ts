import { Type } from 'class-transformer';
import { IsMongoId, IsString, IsUrl } from 'class-validator';
import { Types } from 'mongoose';

export class CreateTrackDto {
  @IsString()
  spotifyId: string;
  
  @IsUrl()
  streamURL: string;

  @IsUrl()
  pictureURL: string;

  @IsMongoId({ each: true })
  @Type(() => Types.ObjectId)
  artists: Types.ObjectId[];
}
