import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false, timestamps: true, autoIndex: true })
export class SpotifyToYoutube {
  @Prop({ unique: true })
  spotifyId: string;

  @Prop({ unique: true, required: false })
  youtubeId: string;
}

const SpotifyToYoutubeSchema = SchemaFactory.createForClass(SpotifyToYoutube);

export default SpotifyToYoutubeSchema;
