import { Module } from '@nestjs/common';
import { MeService } from './me.service';
import { MeController } from './me.controller';
import { TracksModule } from 'src/tracks/tracks.module';

@Module({
  imports:[TracksModule],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}
