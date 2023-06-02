import { ApiProperty } from '@nestjs/swagger';
export class LocalLoginDTO {
  @ApiProperty({ example: 'user@gmail.com' })
  username: string;

  @ApiProperty({ example: '123' })
  password: string;
}
