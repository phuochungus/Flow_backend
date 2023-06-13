import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import Fuse from 'fuse.js';
import SpotifyToYoutubeMusic from 'spotify-to-ytmusic';

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
  private spotifyToYoutubeMusic: any;
  async onModuleInit() {
    this.searchMusics = (await import('node-youtube-music')).searchMusics;
    this.spotifyToYoutubeMusic = await SpotifyToYoutubeMusic({
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });
  }

  async getYoutubeURLFromSpotify(
    spotifyTrack: SpotifyApi.SingleTrackResponse,
  ): Promise<string> {
    const youtubeURL = await this.getYoutubeIdFromSpotifyTrack(spotifyTrack);
    // return `https://www.youtube.com/watch?v=${youtubeId}`;
    return youtubeURL;
  }

  async getYoutubeIdFromSpotifyTrack(
    spotifyTrack: SpotifyApi.SingleTrackResponse,
  ) {
    return await this.spotifyToYoutubeMusic(spotifyTrack.id);
    // const searchResults: YoutubeVideo[] = await this.searchMusics(
    //   spotifyTrack.name +
    //     ' ' +
    //     spotifyTrack.artists.map((e) => {
    //       return e.name + ' ';
    //     }),
    // );
    // if (searchResults.length == 0) throw new NotFoundException();
    // const tmp1 = this.filterResults(
    //   searchResults.map((e) => {
    //     return {
    //       ...e,
    //       artists: e.artists
    //         .map((e) => {
    //           return e.name;
    //         })
    //         .toString(),
    //     };
    //   }),
    //   'title',
    //   spotifyTrack.name,
    // );

    // // const tmp3 = tmp1.sort(
    // //   (a, b) =>
    // //     Math.abs(a.duration.totalSeconds - spotifyTrack.duration_ms / 1000) -
    // //     Math.abs(b.duration.totalSeconds - spotifyTrack.duration_ms / 1000),
    // // );

    // const tmp2 = this.filterResults(
    //   tmp1,
    //   'artists',
    //   spotifyTrack.artists
    //     .map((e) => {
    //       return e.name;
    //     })
    //     .sort()
    //     .toString(),
    //   0.1,
    // );

    // const isDebug = true;
    // if (isDebug) {
    //   console.log('*expect:');
    //   console.log(spotifyTrack);
    //   console.log('expect: ' + spotifyTrack.name);
    //   console.log(tmp1);
    //   console.log(
    //     'expect: ' + spotifyTrack.artists.map((e) => e.name).toString(),
    //   );
    //   console.log(tmp2);
    // }

    // // if (tmp3.length != 0) return tmp3[0].youtubeId;
    // if (tmp2.length != 0) return tmp2[0].youtubeId;
    // if (tmp1.length != 0) return tmp1[0].youtubeId;
    // return searchResults[0].youtubeId;
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
