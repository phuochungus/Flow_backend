import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Lyrics } from '../../tracks/entities/lyrics.entity';

@Schema({
  versionKey: false,
  timestamps: false,
  autoIndex: true,
})
export class TrackLyrics {
  @Prop({ unique: true })
  trackId: string;

  @Prop({
    type: [
      {
        startTimeMs: Number,
        words: String,
        _id: false,
      },
    ],
  })
  lyrics: Lyrics[];
}

const TrackLyricsSchema = SchemaFactory.createForClass(TrackLyrics);

export default TrackLyricsSchema;
