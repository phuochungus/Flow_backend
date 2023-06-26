import { BadGatewayException, Injectable } from '@nestjs/common';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import { recentlySearchItem } from 'src/users/schemas/user.schema';
import { SimplifiedArtistWithImages } from 'src/artists/entities/simplified-artist-with-images.entity';
import { SimplifiedAlbum } from 'src/albums/entities/album-simplofy.entity';
import { PushHistoryDTO } from './dto/PushHistory.dto';
import { SimplifiedTrack } from 'src/tracks/entities/simplified-track.dto';
import { Track } from 'src/tracks/entities/track.entity';
import { EntityType } from '../albums/schemas/album.schema';

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
    user.save();
    return user.recentlyPlayed;
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
    user.save();
    return user.recentlySearch;
  }

  async removeFromSearchHistory(user: any, id: string) {
    if (user.recentlySearch.length == 0) return;
    if (id == 'all') {
      user.recentlySearch = [];
      user.save();
      return user.recentlySearch;
    }
    const index = user.recentlySearch.findIndex((e) => e.id == id);
    user.recentlySearch = this.removeFromArray(user.recentlySearch, index);
    user.save();
    return user.recentlySearch;
  }

  async displaySearchHistory(user: any): Promise<SimplifiedItem[]> {
    const orderedItems: recentlySearchItem[] = user.recentlySearch;
    const artists: string[] = [];
    const albums: string[] = [];
    const tracks: string[] = [];
    for (let index in orderedItems) {
      let { id, type } = orderedItems[index];
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

    try {
      const [albumsRes, tracksRes, artistsRes] = await Promise.all([
        albums.length > 0
          ? this.spotifyApiService.spotifyWebApi
              .getAlbums(albums)
              .then((response) => response.body.albums)
              .then((albums) =>
                albums.map((album) => {
                  return {
                    id: album.id,
                    type: EntityType.album,
                    name: album.name,
                    images: album.images,
                    artists: album.artists.map(({ id, name }) => {
                      return { id, name };
                    }),
                  };
                }),
              )
          : Promise.resolve([]),
        tracks.length > 0
          ? this.spotifyApiService.spotifyWebApi
              .getTracks(tracks)
              .then((response) => response.body.tracks)
              .then((tracks) =>
                tracks.map((track) => {
                  return {
                    id: track.id,
                    type: EntityType.track,
                    name: track.name,
                    images: track.album.images,
                    artists: track.artists.map(({ id, name }) => {
                      return { id, name };
                    }),
                  };
                }),
              )
          : Promise.resolve([]),
        artists.length > 0
          ? this.spotifyApiService.spotifyWebApi
              .getArtists(artists)
              .then((response) => response.body.artists)
              .then((artists) =>
                artists.map((artist) => {
                  return {
                    id: artist.id,
                    type: EntityType.artist,
                    name: artist.name,
                    images: artist.images,
                  };
                }),
              )
          : Promise.resolve([]),
      ]);
      const itemsArray = [...albumsRes, ...tracksRes, ...artistsRes];
      const sortingItem = orderedItems.map(({ id }) => id);
      itemsArray.sort(function (a, b) {
        return sortingItem.indexOf(a.id) - sortingItem.indexOf(b.id);
      });
      return itemsArray;
    } catch (error) {
      throw new BadGatewayException();
    }
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
