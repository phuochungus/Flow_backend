import { Injectable, NotFoundException } from '@nestjs/common';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Album } from './schemas/album.schema';

@Injectable()
export class AlbumsService {
  constructor(
    private readonly spotifyApiService: SpotifyApiService,
    @InjectModel(Album.name)
    private AlbumsModel: Model<Album>,
  ) {}
  async findOne(id: string) {
    let albumDoc = await this.AlbumsModel.findOne(
      { id },
      { _id: false },
    ).lean();
    if (albumDoc) {
      const { _id, ...rest } = albumDoc;
      return rest;
    }
    const album = await this.spotifyApiService.findOneAlbumWithFormat(id);
    try {
      const createdAlbumDoc = new this.AlbumsModel(album);
      createdAlbumDoc.save();
      if (album) return album;
      else throw new NotFoundException();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
