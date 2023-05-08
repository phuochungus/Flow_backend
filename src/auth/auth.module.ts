import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport/dist';
import { AuthController } from './auth.controller';
import GoogleStrategy from './strategies/google-oauth2.strategy';
import FacebookStrategy from './strategies/facebook-oauth2.strategy';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import JWTStrategy from './strategies/jwt.stategy';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import UserSchema, { User } from 'src/users/schemas/user.schema';
import LocalStrategy from './strategies/local.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    UsersModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  providers: [
    GoogleStrategy,
    FacebookStrategy,
    AuthService,
    JWTStrategy,
    LocalStrategy,
  ],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
