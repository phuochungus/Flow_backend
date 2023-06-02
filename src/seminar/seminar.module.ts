import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { MeModule } from 'src/me/me.module';
import { SearchModule } from 'src/search/search.module';
import { UsersController } from 'src/users/users.controller';
import { UsersModule } from 'src/users/users.module';
import { SearchController } from './search/search.controller';
import { MeController } from './me/me.controller';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [UsersModule, MeModule, AuthModule, SearchModule],
  controllers: [
    UsersController,
    MeController,
    AuthController,
    SearchController,
  ],
})
export class SeminarModule {}
