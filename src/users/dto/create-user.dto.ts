import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';
import { User } from '../schemas/user.schema';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsDateString()
  birth: Date | undefined;

  @IsString()
  password: string;

  constructor(params: Partial<User>) {
    Object.assign(this, params);
  }
}
