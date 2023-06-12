import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import Fuse from 'fuse.js';

export type YoutubeVideo = {
  youtubeId: string;
  title: string;
  artists: { name: string }[];
  album: string;
  duration: { totalSeconds: number };
};
@Injectable()
export class SpotifyToYoutubeService implements OnModuleInit {
  private searchMusics: (query: string) => Promise<any[]>;

  async onModuleInit() {
    this.searchMusics = (await import('node-youtube-music')).searchMusics;
  }

  async getYoutubeURLFromSpotify(
    spotifyTrack: SpotifyApi.SingleTrackResponse,
  ): Promise<string> {
    const youtubeId = await this.getYoutubeIdFromSpotifyTrack(spotifyTrack);
    return `https://www.youtube.com/watch?v=${youtubeId}`;
  }

  async getYoutubeIdFromSpotifyTrack(
    spotifyTrack: SpotifyApi.SingleTrackResponse,
  ): Promise<string> {
    const isDebug = false;

    const searchResults: YoutubeVideo[] = await this.searchMusics(
      spotifyTrack.name +
        ' ' +
        spotifyTrack.artists.map((e) => {
          return e.name + ' ';
        }),
    );
    if (searchResults.length == 0) throw new NotFoundException();
    const tmp1 = this.filterResults(searchResults, 'title', spotifyTrack.name);

    const tmp2 = this.filterResults(
      tmp1,
      'album',
      spotifyTrack.album.name,
      0.5,
    );

    const tmp3 = this.filterResults(
      tmp1.map((e) => {
        return {
          ...e,
          artists: e.artists
            .map((e) => e.name)
            .sort()
            .toString(),
        };
      }),
      'artists',
      spotifyTrack.artists
        .map((e) => {
          return e.name + ' ';
        })
        .sort()
        .toString(),
    );

    const tmp4 = tmp3.sort(
      (a, b) =>
        Math.abs(a.duration.totalSeconds - spotifyTrack.duration_ms / 1000) -
        Math.abs(b.duration.totalSeconds - spotifyTrack.duration_ms / 1000),
    );
    
    if (isDebug) {
      console.log('expect: ' + spotifyTrack.name);
      console.log(tmp1);
      console.log('expect: ' + spotifyTrack.album.name);
      console.log(tmp2);
      console.log(
        'expect: ' + spotifyTrack.artists.map((e) => e.name).toString(),
      );
      console.log(tmp3);
      console.log('expect: ' + spotifyTrack.duration_ms / 1000);
      console.log(tmp4);
    }

    if (tmp4.length != 0) return tmp4[0].youtubeId;
    if (tmp3.length != 0) return tmp3[0].youtubeId;
    if (tmp2.length != 0) return tmp2[0].youtubeId;
    if (tmp1.length != 0) return tmp1[0].youtubeId;
    return searchResults[0].youtubeId;
  }

  private filterResults(
    originArray: any[],
    fieldName: string,
    fieldValue: string,
    threshold: number = 0.5,
  ): YoutubeVideo[] {
    const fuse = new Fuse(originArray, {
      keys: [fieldName],
      includeScore: true,
      shouldSort: true,
      threshold,
    });

    const filterdArray = fuse.search(fieldValue);

    const transformToOriginFormatArray = filterdArray.map((e) => {
      return e.item;
    });

    return transformToOriginFormatArray;
  }
}
