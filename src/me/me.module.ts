import { Module } from '@nestjs/common';
import { MeService } from './me.service';
import { MeController } from './me.controller';
import { PlayerModule } from 'src/player/player.module';

@Module({
  imports: [PlayerModule],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}
