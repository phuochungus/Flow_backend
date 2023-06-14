import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  SimplifiedArtist,
  SimplifiedArtistSchema,
} from '../../artists/entities/simplified-artist.entity';
import {
  ImageObject,
  ImageObjectSchema,
} from '../../tracks/entities/image-object.entity';
import { Track, TrackSchema } from '../../tracks/entities/track.entity';

export enum EntityType {
  album = 'album',
  track = 'track',
  artist = 'artist',
}

export enum AlbumType {
  album = 'album',
  single = 'single',
  compilation = 'compilation',
}

@Schema({ timestamps: false, versionKey: false, autoIndex: true })
export class Album {
  @Prop({ unique: true })
  id: string;

  @Prop({ enum: EntityType, default: 'album' })
  type: EntityType = EntityType.album;

  @Prop({ enum: AlbumType })
  album_type: AlbumType;

  @Prop()
  name: string;

  @Prop({ type: [ImageObjectSchema] })
  images: ImageObject[];

  @Prop({ type: [SimplifiedArtistSchema] })
  artists: SimplifiedArtist[];

  @Prop()
  total_duration: number;

  @Prop({ type: [TrackSchema] })
  track: Track[];
}

export const AlbumSchema = SchemaFactory.createForClass(Album);
