import { Type } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Track {
  @Prop()
  spotifyId: string;

  @Prop()
  name: string;

  @Prop()
  streamURL: string;

  @Prop()
  pictureURL: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Artist' }] })
  artists: Types.ObjectId[];
}

export const TrackSchema = SchemaFactory.createForClass(Track);
