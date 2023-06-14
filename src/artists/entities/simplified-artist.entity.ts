import { Prop } from '@nestjs/mongoose';

export class SimplifiedArtist {
  @Prop()
  id: string;

  @Prop()
  name: string;
}
