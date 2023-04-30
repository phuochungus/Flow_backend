import { Module } from '@nestjs/common';
import { MeService } from './me.service';
import { MeController } from './me.controller';
import { SpotifyApiModule } from 'src/spotify-api/spotify-api.module';

@Module({
  imports: [SpotifyApiModule],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}
