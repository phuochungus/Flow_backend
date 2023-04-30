import { IsString } from 'class-validator';

export default class IdDTO {
  @IsString()
  id: string;
}
