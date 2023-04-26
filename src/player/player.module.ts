import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { TracksModule } from 'src/tracks/tracks.module';

@Module({
  imports: [TracksModule],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
