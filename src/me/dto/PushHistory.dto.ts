import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EntityType } from 'src/albums/entities/album.entity';

export class PushHistoryDTO {
  @IsString()
  id: string;

  @IsOptional()
  @IsEnum(EntityType)
  type: EntityType;
}
