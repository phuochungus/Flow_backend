import {
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export default class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { _id: string }) {
    try {
      return await this.userModel
        .findOne({ _id: payload._id })
        .select(['-password']);
    } catch (error) {
      if (error instanceof NotFoundException) throw new UnauthorizedException();
      if (!(error instanceof HttpException)) console.error(error);
      throw error;
    }
  }
}
