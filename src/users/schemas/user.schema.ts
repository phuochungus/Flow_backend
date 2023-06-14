import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EntityType } from '../../albums/schemas/album.schema';

export class recentlySearchItem {
  id: string;
  type: EntityType;
}
@Schema({ versionKey: false, timestamps: true, autoIndex: true })
export class User {
  @Prop({ unique: true })
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
  favourites: string[];
}

const UserSchema = SchemaFactory.createForClass(User);

export default UserSchema;
