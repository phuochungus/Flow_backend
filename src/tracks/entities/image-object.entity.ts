import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: false, _id: false, versionKey: false })
export class ImageObject implements SpotifyApi.ImageObject {
  @Prop({ type: Number, default: null })
  height?: number | undefined;

  @Prop()
  url: string;

  @Prop({ type: Number, default: null })
  width?: number | undefined;
}

export const ImageObjectSchema = SchemaFactory.createForClass(ImageObject);
