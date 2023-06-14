import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, timestamps: false, versionKey: false })
export class SimplifiedArtist {
  @Prop()
  id: string;

  @Prop()
  name: string;
}

export const SimplifiedArtistSchema =
  SchemaFactory.createForClass(SimplifiedArtist);
