import { Module } from '@nestjs/common';
import { YoutubeMusicService } from './youtube-music.service';

@Module({
  providers: [YoutubeMusicService],
  exports: [YoutubeMusicService],
})
export class YoutubeMusicModule {}
