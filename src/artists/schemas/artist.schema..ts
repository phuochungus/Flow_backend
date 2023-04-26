import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Artist {
  @Prop()
  spotifyId: string;

  @Prop()
  name: string;

  @Prop()
  pictureURL: string;

  @Prop()
  description: string;
}
