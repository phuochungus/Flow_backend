import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { log } from 'console';
import { Strategy } from 'passport-local';
import { UsersService } from 'src/users/users.service';

@Injectable()
export default class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private usersService: UsersService) {
    super();
  }

  async validate(usernameOrEmail: string, password: string) {
    console.log(usernameOrEmail, password);
    const payload = await this.usersService.findAccountMatchUsernameOrEmail(
      usernameOrEmail,
      password,
    );
    return payload;
  }
}
