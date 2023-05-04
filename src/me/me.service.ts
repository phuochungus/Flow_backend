import { Injectable } from '@nestjs/common';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';

@Injectable()
export class MeService {
  constructor(private readonly spotifyApiService: SpotifyApiService) {}

  async addToPlayHistory(user: any, id: string) {
    let array: string[] = user.recentlyPlayed;
    if (array.includes(id)) {
      user.recentlyPlayed = this.bubbleUp(array, id);
    } else if (array.length < 15) {
      user.recentlyPlayed.splice(0, 0, id);
    } else {
      user.recentlyPlayed.splice(0, 0, id);
      user.recentlyPlayed.pop();
    }
    await user.save();
  }

  async addToSearchHistory(user: any, id: string) {
    let array: string[] = user.recentlySearch;
    if (array.includes(id)) {
      user.recentlySearch = this.bubbleUp(array, id);
    } else if (array.length < 15) {
      user.recentlySearch.splice(0, 0, id);
    } else {
      user.recentlySearch.splice(0, 0, id);
      user.recentlySearch.pop();
    }
    await user.save();
  }

  async removeFromSearchHistory(user: any, id: string) {
    let ids: string[] = user.recentlySearch;
    if (ids.includes(id)) {
      for (let index in ids) {
        if (ids[index] == id) {
          for (
            let index2 = parseInt(index);
            index2 < ids.length - 1;
            ++index2
          ) {
            ids[index2] = ids[index2 - 1];
          }
          ids.pop();
          user.recentlyPlayed = ids;
          await user.save();
        }
      }
    }
  }

  private bubbleUp(ids: string[], id: string) {
    for (let index in ids) {
      if (ids[index] == id) {
        for (let iterator = parseInt(index); iterator >= 1; iterator--) {
          ids[iterator] = ids[iterator - 1];
        }
        ids[0] = id;
      }
    }
    return ids;
  }

  async displaySearchHistory(user: any) {
    const ids: string[] = user.recentlySearch;
    const promises = ids.map(async (e) => {
      return await this.spotifyApiService.findOneTrackWithFormat(e);
    });
    let result: any[];
    await Promise.all(promises).then((value) => {
      result = value;
    });
    return result;
  }

  async displayPlayHistory(user: any) {
    const ids: string[] = user.recentlyPlayed;
    const promises = ids.map(async (e) => {
      return await this.spotifyApiService.findOneTrackWithFormat(e);
    });
    let result: {
      id: string;
      name: string;
      type: string;
      duration_ms: number;
      images: SpotifyApi.ImageObject[];
      artists: { id: string; name: string }[];
    }[];
    await Promise.all(promises).then((value) => {
      result = value;
    });
    return result;
  }

  async followArtist(user: any, id: string) {
    const array: string[] = user.followingArtists;
    if (array.includes(id)) return;
    user.followingArtists.push(id);
    await user.save();
    return;
  }

  async unfollowArtist(user: any, id: string) {
    const index = user.followingArtists.indexOf(id);
    if (index > -1) user.followingArtists.splice(id, 1);
    await user.save();
  }
}
