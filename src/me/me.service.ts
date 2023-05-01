import { Injectable } from '@nestjs/common';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';

@Injectable()
export class MeService {
  constructor(private readonly spotifyApiService: SpotifyApiService) {}

  async addToPlayHistory(user: any, id: string) {
    let array: string[] = user.recentlyPlayed;
    if (array.includes(id)) {
      user.recentlyPlayed = this.bubbleUp(array, id);
      user.save();
    } else if (array.length < 15) {
      user.recentlyPlayed.splice(0, 0, id);
      user.save();
    } else {
      user.recentlyPlayed.splice(0, 0, id);
      user.recentlyPlayed.pop();
      user.save();
    }
  }

  addToSearchHistory(user: any, id: string) {
    let array: string[] = user.recentlySearch;
    if (array.includes(id)) {
      user.recentlySearch = this.bubbleUp(array, id);
      user.save();
    } else if (array.length < 15) {
      user.recentlySearch.splice(0, 0, id);
      user.save();
    } else {
      user.recentlySearch.splice(0, 0, id);
      user.recentlySearch.pop();
      user.save();
    }
  }

  removeFromSearchHistory(user: any, id: string) {
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
          user.save();
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

  displaySearchHistory(user: any) {
    const ids: string[] = user.recentlySearch;
    return ids.map(async (e) => {
      return await this.spotifyApiService.findOne(e);
    });
  }

  displayPlayHistory(user: any) {
    const ids: string[] = user.recentlyPlayed;
    return ids.map(async (e) => {
      return await this.spotifyApiService.findOne(e);
    });  }
}
