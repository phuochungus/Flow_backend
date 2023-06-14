import {
  SimplifiedArtist,
  SimplifiedArtistSchema,
} from 'src/artists/entities/simplified-artist.entity';
import { ImageObject, ImageObjectSchema } from './image-object.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EntityType } from '../../albums/schemas/album.schema';

@Schema({ timestamps: false, versionKey: false })
export class Track {
  @Prop()
  id: string;

  @Prop()
  name: string;

  @Prop({ enum: EntityType, default: 'track' })
  type: EntityType = EntityType.track;

  @Prop()
  duration_ms: number;

  @Prop({ type: [ImageObjectSchema] })
  images: ImageObject[];

  @Prop({ type: [SimplifiedArtistSchema] })
  artists: SimplifiedArtist[];
}

export const TrackSchema = SchemaFactory.createForClass(Track);

export class TrackWithIsFavourite extends Track {
  isFavourite: boolean;
}
