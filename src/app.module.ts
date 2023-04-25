import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MusicsModule } from './musics/musics.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { MeModule } from './me/me.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MusicsModule,
    AuthModule,
    UsersModule,
    MongooseModule.forRoot(
      process.env.MONGODB_URL,
      { autoIndex: true },
    ),
    MeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
