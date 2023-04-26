import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Track' }] })
  recentPlayed: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Artist' }] })
  followingArtists: Types.ObjectId[];
}

const UserSchema = SchemaFactory.createForClass(User);

export default UserSchema;
