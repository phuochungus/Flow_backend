import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';
import { User } from '../schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'phuochungus@gmail.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false, example: 'phuochungus' })
  @IsOptional()
  @IsString()
  username: string;

  @ApiProperty({ required: false, example: '2003-08-19' })
  @IsOptional()
  @IsDateString()
  birth: Date | undefined;

  @ApiProperty({ example: '123123123' })
  @IsString()
  password: string;

  constructor(params: Partial<User>) {
    Object.assign(this, params);
  }
}
