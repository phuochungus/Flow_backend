import { ApiProperty } from '@nestjs/swagger';
export class LocalLoginDTO {
  @ApiProperty({ example: 'phuochungus@gmail.com' })
  username: string;

  @ApiProperty({ example: '123123123' })
  password: string;
}
