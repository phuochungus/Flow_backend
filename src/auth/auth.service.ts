import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { use } from 'passport';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  private generateAccessToken(_id: string): string {
    return this.jwtService.sign({ _id });
  }

  async findOneOrCreate(userDto: {
    name: string;
    email: string;
    birthday: string | undefined;
  }) {
    const user = await this.userService.findOneByEmail(userDto.email);
    if (user) {
      return {
        accessToken: this.generateAccessToken(user._id.toString()),
      };
    } else {
      const createdUser = await this.userService.create(
        new CreateUserDto({
          username: userDto.name,
          email: userDto.email,
          birth: userDto.birthday ? new Date(userDto.birthday) : undefined,
        }),
      );
      return {
        accessToken: this.generateAccessToken(createdUser._id.toString()),
      };
    }
  }
}
