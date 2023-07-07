import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Album, AlbumType, EntityType } from './schemas/album.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';
import { AlbumRepository } from '../abstract/abstract';

@Injectable()
export class SpotifyAlbumRepository implements AlbumRepository {
  constructor(
    @InjectModel(Album.name)
    private AlbumsModel: Model<Album>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly spotifyApiService: SpotifyApiService,
  ) {}

  async findOne(id: string): Promise<Album> {
    try {
      const album = await this.findOneAlbumWithFormat(id);
      if (album) return album;
      else throw new NotFoundException();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findOneAlbumWithFormat(id: string): Promise<Album> {
    const cacheResult = await this.cacheManager.get(`album_${id}`);
    if (cacheResult) return cacheResult as Album;

    let albumDoc = await this.AlbumsModel.findOne(
      { id },
      { _id: false },
    ).lean();
    if (albumDoc) return albumDoc;

    const fullAlbumObject = (
      await this.spotifyApiService.spotifyWebApi.getAlbum(id)
    ).body;
    const album = {
      id: fullAlbumObject.id,
      type: EntityType.album,
      album_type: AlbumType[fullAlbumObject.album_type.toString()],
      name: fullAlbumObject.name,
      images: fullAlbumObject.images,
      artists: fullAlbumObject.artists.map(({ id, name }) => {
        return { id, name };
      }),
      total_duration: fullAlbumObject.tracks.items.reduce(
        (accumulate, current) => {
          return accumulate + current.duration_ms;
        },
        0,
      ),
      track: fullAlbumObject.tracks.items.map(
        ({ id, name, duration_ms, artists }) => {
          const track = {
            id,
            name,
            type: EntityType.track,
            duration_ms,
            artists: artists.map(({ id, name }) => {
              return { id, name };
            }),
            images: fullAlbumObject.images,
          };

          this.cacheManager.set(`track_${id}`, track);
          return track;
        },
      ),
    };

    this.cacheManager.set(`album_${id}`, album);
    this.storeAlbumToDb(album);

    return album;
  }

  private async storeAlbumToDb(album: Album) {
    try {
      const createdAlbumDoc = new this.AlbumsModel(album);
      return await createdAlbumDoc.save();
    } catch (error) {
      console.error(error);
    }
  }

  async findMany(ids: string[]): Promise<Album[]> {
    let queryIds = [];
    let responseArray: Album[] = [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const cacheResult = await this.cacheManager.get(`album_${id}`);
      if (cacheResult) {
        responseArray.push(cacheResult as Album);
      } else {
        const albumFromDB = await this.AlbumsModel.findOne(
          { id },
          { _id: false },
        );
        if (albumFromDB) {
          responseArray.push(albumFromDB);
        } else queryIds.push(id);
      }
    }

    let fullAlbumObjects: SpotifyApi.AlbumObjectFull[];
    if (queryIds.length > 0)
      fullAlbumObjects = (
        await this.spotifyApiService.spotifyWebApi.getAlbums(queryIds)
      ).body.albums;
    else fullAlbumObjects = [];
    const albums = fullAlbumObjects.map((fullAlbumObject) => {
      return {
        id: fullAlbumObject.id,
        type: EntityType.album,
        album_type: AlbumType[fullAlbumObject.album_type.toString()],
        name: fullAlbumObject.name,
        images: fullAlbumObject.images,
        artists: fullAlbumObject.artists.map(({ id, name }) => {
          return { id, name };
        }),
        total_duration: fullAlbumObject.tracks.items.reduce(
          (accumulate, current) => {
            return accumulate + current.duration_ms;
          },
          0,
        ),
        track: fullAlbumObject.tracks.items.map(
          ({ id, name, duration_ms, artists }) => {
            return {
              id,
              name,
              type: EntityType.track,
              duration_ms,
              artists: artists.map(({ id, name }) => {
                return { id, name };
              }),
              images: fullAlbumObject.images,
            };
          },
        ),
      };
    });

    for (let i = 0; i < albums.length; ++i) {
      this.cacheManager.set(`album_${albums[i].id}`, albums[i]);
      this.storeAlbumToDb(albums[i]);
    }

    responseArray = [...responseArray, ...albums];

    responseArray.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

    return responseArray;
  }
}
