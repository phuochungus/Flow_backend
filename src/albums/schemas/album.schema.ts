import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class Album {
  @Prop()
  spotifyId: string;

  @Prop()
  pictureURL: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Track' }] })
  tracks: Types.ObjectId[];
}
