import { Module } from '@nestjs/common';
import { MusixmatchLyricsRepository } from './lyrics.service';
import { LyricsController } from './lyrics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TrackLyrics } from './schemas/lyric.schema';
import TrackLyricsSchema from './schemas/lyric.schema';
import { HttpModule } from '@nestjs/axios';
import { LyricsRepository } from '../abstract/abstract';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrackLyrics.name, schema: TrackLyricsSchema },
    ]),
    HttpModule,
  ],
  controllers: [LyricsController],
  providers: [
    {
      provide: LyricsRepository,
      useClass: MusixmatchLyricsRepository,
    },
  ],
})
export class LyricsModule {}
