import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false, timestamps: true, _id: false })
export class SongInfo {
  @Prop({ required: true })
  name: string;

  @Prop()
  spotifyId: string;

  @Prop()
  streamLine: string;
}

@Schema({ versionKey: false, timestamps: true, _id: false })
export class Artist {
  @Prop({ required: true })
  name: string;

  @Prop()
  spotifyId: string;
}

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
  playedTracks: SongInfo[];

  @Prop()
  followingActists: Artist[];
}

const UserSchema = SchemaFactory.createForClass(User);

export default UserSchema;
