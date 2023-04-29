import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Track, TrackSchema } from './schemas/track.schema';
import { SpotifyApiModule } from 'src/spotify-api/spotify-api.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [SpotifyApiModule],
  controllers: [TracksController],
  providers: [TracksService],
  exports: [TracksService],
})
export class TracksModule {}
