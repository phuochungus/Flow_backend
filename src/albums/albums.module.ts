import { Module } from '@nestjs/common';
import { SpotifyAlbumRepository } from './albums.service';
import { AlbumsController } from './albums.controller';
import { SpotifyApiModule } from 'src/spotify-api/spotify-api.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Album, AlbumSchema } from './schemas/album.schema';
import { AlbumRepository } from '../abstract/abstract';

@Module({
  imports: [
    SpotifyApiModule,
    MongooseModule.forFeature([{ name: Album.name, schema: AlbumSchema }]),
  ],
  controllers: [AlbumsController],
  providers: [
    {
      provide: AlbumRepository,
      useClass: SpotifyAlbumRepository,
    },
  ],
  exports: [AlbumRepository],
})
export class AlbumsModule {}
