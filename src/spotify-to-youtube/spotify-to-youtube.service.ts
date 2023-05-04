import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import Fuse from 'fuse.js';
import YoutubeMusicApi from 'youtube-music-api';

export type YoutubeVideo = {
  youtubeId: string;
  title: string;
  artists: { name: string }[];
  album: string;
  duration: { totalSeconds: number };
};
@Injectable()
export class SpotifyToYoutubeService implements OnModuleInit {
  api = new YoutubeMusicApi();

  private searchMusics: (query: string) => Promise<any[]>;

  async onModuleInit() {
    this.searchMusics = (await import('node-youtube-music')).searchMusics;
  }

  async getYoutubeURLFromSpotify(
    spotifyTrack: SpotifyApi.SingleTrackResponse,
  ): Promise<string> {
    return `https://www.youtube.com/watch?v=${await this.getYoutubeIdFromSpotifyTrack(
      spotifyTrack,
    )}`;
  }

  async getYoutubeIdFromSpotifyTrack(
    spotifyTrack: SpotifyApi.SingleTrackResponse,
  ): Promise<string> {
    const searchResults: YoutubeVideo[] = await this.searchMusics(
      spotifyTrack.name +
        ' ' +
        spotifyTrack.artists.map((e) => {
          return e.name + ' ';
        }),
    );
    if (searchResults.length == 0) throw new NotFoundException();
    const tmp1 = this.filterResults(searchResults, 'title', spotifyTrack.name);
    const tmp2 = this.filterResults(tmp1, 'album', spotifyTrack.album.name);
    console.log(tmp2);
    return tmp2[0].youtubeId;
  }

  private filterResults(
    originArray: YoutubeVideo[],
    fieldName: string,
    fieldValue: string,
  ): YoutubeVideo[] {
    const fuse = new Fuse<YoutubeVideo>(originArray, {
      keys: [fieldName],
      includeScore: true,
    });

    const filterdArray = fuse.search(fieldValue);
    filterdArray.sort((n1, n2) => {
      const tmp = n1.score - n2.score;
      if (tmp != 0) return tmp;
      return n1.refIndex - n2.refIndex;
    });

    const transformToOriginFormatArray = filterdArray.map((e) => {
      return e.item;
    });

    return transformToOriginFormatArray;
  }
}
