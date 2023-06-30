import { Module } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import { SpotifyApiModule } from 'src/spotify-api/spotify-api.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Album, AlbumSchema } from './schemas/album.schema';

@Module({
  imports: [
    SpotifyApiModule,
    MongooseModule.forFeature([{ name: Album.name, schema: AlbumSchema }]),
  ],
  controllers: [AlbumsController],
  providers: [AlbumsService],
  exports: [AlbumsService],
})
export class AlbumsModule {}
