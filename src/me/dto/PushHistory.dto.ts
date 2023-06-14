import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EntityType } from '../../albums/schemas/album.schema';
export class PushHistoryDTO {
  @IsString()
  id: string;

  @IsOptional()
  @IsEnum(EntityType)
  type: EntityType;
}
