import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'phuochungus@gmail.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false, example: 'phuochungus' })
  @IsString()
  username: string;

  @ApiProperty({ required: false, example: '2003-08-19' })
  @IsOptional()
  @IsDateString()
  birth?: string;

  @ApiProperty({ example: '123123123' })
  @IsOptional()
  @IsString()
  password?: string;
}
