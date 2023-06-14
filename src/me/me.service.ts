import { Injectable } from '@nestjs/common';
import { EntityType } from 'src/albums/entities/album.entity';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import { recentlySearchItem } from 'src/users/schemas/user.schema';
import { SimplifiedArtistWithImages } from 'src/artists/entities/simplified-artist-with-images.entity';
import { SimplifiedAlbum } from 'src/albums/entities/album-simplofy.entity';
import { PushHistoryDTO } from './dto/PushHistory.dto';
import { SimplifiedTrack } from 'src/tracks/entities/simplified-track.dto';
import { Track } from 'src/tracks/entities/track.entity';

export type SimplifiedItem =
  | SimplifiedArtistWithImages
  | SimplifiedTrack
  | SimplifiedAlbum;

@Injectable()
export class MeService {
  constructor(private readonly spotifyApiService: SpotifyApiService) {}

  async addToPlayHistory(user: any, id: string) {
    let array: string[] = user.recentlyPlayed;
    if (array.includes(id)) {
      user.recentlyPlayed.sort((x, y) => (x == id ? -1 : y == id ? 1 : 0));
    } else if (array.length < 15) {
      user.recentlyPlayed.unshift(id);
    } else {
      user.recentlyPlayed.unshift(id);
      user.recentlyPlayed.pop();
    }
    await user.save();
  }

  async addToSearchHistory(user: any, pushHistoryDto: PushHistoryDTO) {
    let array: recentlySearchItem[] = user.recentlySearch;
    const index = array.findIndex((e) => e.id == pushHistoryDto.id);
    if (index > -1) {
      user.recentlySearch.sort((x, y) =>
        x.id == pushHistoryDto.id ? -1 : y.id == pushHistoryDto.id ? 1 : 0,
      );
    } else if (array.length < 15) {
      user.recentlySearch.unshift(pushHistoryDto);
    } else {
      user.recentlySearch.unshift(pushHistoryDto);
      user.recentlySearch.pop();
    }
    await user.save();
  }

  async removeFromSearchHistory(user: any, id: string) {
    if (user.recentlySearch.length == 0) return;
    const index = user.recentlySearch.findIndex((e) => e.id == id);
    user.recentlySearch = this.removeFromArray(user.recentlySearch, index);
    await user.save();
  }

  async displaySearchHistory(user: any): Promise<SimplifiedItem[]> {
    const items: recentlySearchItem[] = user.recentlySearch;
    const artists: string[] = [];
    const albums: string[] = [];
    const tracks: string[] = [];
    for (let index in items) {
      let { id, type } = items[index];
      switch (type) {
        case EntityType.album:
          albums.push(id);
          break;
        case EntityType.track:
          tracks.push(id);
          break;
        case EntityType.artist:
          artists.push(id);
          break;
        default:
          break;
      }
    }

    let returnArray = new Array(items.length);
    await Promise.all([
      this.spotifyApiService.spotifyWebApi
        .getAlbums(albums)
        .then((value) => {
          const albums = value.body.albums;
          for (const album of albums) {
            let index = items.findIndex((e) => e.id == album.id);
            returnArray[index] = {
              id: album.id,
              type: EntityType.album,
              name: album.name,
              images: album.images,
              artists: album.artists.map(({ id, name }) => {
                return { id, name };
              }),
            };
          }
        })
        .catch((error) => {
          console.log(error);
        }),

      this.spotifyApiService.spotifyWebApi
        .getArtists(artists)
        .then((value) => {
          const artists = value.body.artists;
          for (const artist of artists) {
            let index = items.findIndex((e) => e.id == artist.id);
            returnArray[index] = {
              id: artist.id,
              type: EntityType.artist,
              name: artist.name,
              images: artist.images,
            };
          }
        })
        .catch((error) => {
          console.log(error);
        }),

      this.spotifyApiService.spotifyWebApi
        .getTracks(tracks)
        .then((value) => {
          const tracks = value.body.tracks;
          for (const track of tracks) {
            let index = items.findIndex((e) => e.id == track.id);
            returnArray[index] = {
              id: track.id,
              type: EntityType.track,
              name: track.name,
              images: track.album.images,
              artists: track.artists.map((e) => {
                return { id: e.id, name: e.name };
              }),
            };
          }
        })
        .catch((error) => {
          console.log(error);
        }),
    ]);
    return returnArray;
  }

  async displayPlayHistory(user: any): Promise<Track[]> {
    const ids: string[] = user.recentlyPlayed;
    const promises = ids.map(async (e) => {
      return await this.spotifyApiService.findOneTrackWithFormat(e);
    });
    let result: {
      id: string;
      name: string;
      type: EntityType;
      duration_ms: number;
      images: SpotifyApi.ImageObject[];
      artists: { id: string; name: string }[];
    }[] = [];
    await Promise.all(promises).then((value) => {
      result = value;
    });
    return result;
  }

  async addToFavourite(user: any, id: string) {
    if (user.favourites.includes(id)) return;
    user.favourites.push(id);
    await user.save();
  }

  async removeFromFavourite(user: any, id: string) {
    user.favourites = this.removeFromArray(
      user.favourites,
      user.favourites.findIndex((e) => e == id),
    );

    await user.save();
  }

  private removeFromArray(array: any[], index: number): any[] {
    if (index > -1) array.splice(index, 1);
    return array;
  }
}
