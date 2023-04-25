import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';

@Injectable()
export default class FacebookStrategy extends PassportStrategy(
  Strategy,
  'facebook',
) {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/facebook-redirect',
      scope: ['public_profile', 'user_birthday', 'email'],
      profileFields: ['displayName', 'email', 'birthday'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { name, email, birthday } = profile._json;
    return { name, email, birthday };
  }
}
