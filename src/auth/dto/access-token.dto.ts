import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenDTO {
  @ApiProperty()
  accessToken: string;
}
