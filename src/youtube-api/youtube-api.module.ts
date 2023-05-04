import { Module } from '@nestjs/common';
import { YoutubeApiService } from './youtube-api.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [YoutubeApiService],
  exports: [YoutubeApiService],
})
export class YoutubeApiModule {}
