import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EntityType } from 'src/albums/entities/album.entity';

export class recentlySearchItem {
  id: string;
  type: EntityType;
}
@Schema({ versionKey: false, timestamps: true })
export class User {
  @Prop({ unique: true, sparse: true })
  email: string;

  @Prop()
  username: string;

  @Prop()
  birth: Date;

  @Prop()
  password: string;

  @Prop()
  recentlyPlayed: string[];

  @Prop({
    type: [
      {
        _id: false,
        id: String,
        type: { type: String, enum: EntityType },
      },
    ],
  })
  recentlySearch: recentlySearchItem[];

  @Prop()
  followingArtists: string[];

  @Prop()
  favourites: string[];
}

const UserSchema = SchemaFactory.createForClass(User);

export default UserSchema;
