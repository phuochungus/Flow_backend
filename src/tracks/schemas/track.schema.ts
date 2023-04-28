import { Type } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Track {
  @Prop()
  spotifyId: string;

  @Prop()
  nhaccuatuiId: string;
}

export const TrackSchema = SchemaFactory.createForClass(Track);
