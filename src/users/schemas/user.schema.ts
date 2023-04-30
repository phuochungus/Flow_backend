import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class User {
  @Prop({ unique: true, sparse: true })
  email: string;

  @Prop({ unique: true, sparse: true })
  username: string;

  @Prop()
  birth: Date;

  @Prop()
  password: string;

  @Prop()
  recentlyPlayed: ObjectId[];

  @Prop()
  recentlySearch: ObjectId[];

  @Prop()
  followingArtists: ObjectId[];

  @Prop()
  favourites: ObjectId[];
}

const UserSchema = SchemaFactory.createForClass(User);

export default UserSchema;
