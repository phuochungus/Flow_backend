import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@gmail.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false, example: 'John' })
  @IsString()
  username: string;

  @ApiProperty({ required: false, example: '2000-01-01' })
  @IsOptional()
  @IsDateString()
  birth?: string;

  @ApiProperty({ example: '123' })
  @IsOptional()
  @IsString()
  password?: string;
}
