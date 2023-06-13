import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import Fuse from 'fuse.js';
import parseUrl from 'parse-url';
import SpotifyToYoutubeMusic from 'spotify-to-ytmusic';
import { YoutubeApiService } from '../youtube-api/youtube-api.service';
import { toSeconds, parse } from 'iso8601-duration';

export type YoutubeVideo = {
  youtubeId: string;
  title: string;
  artists: { name: string }[];
  album: string;
  duration: { totalSeconds: number };
};
@Injectable()
export class SpotifyToYoutubeService implements OnModuleInit {
  constructor(private youtubeApiService: YoutubeApiService) {}
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
    const youtubeId = await this.getYoutubeIdFromSpotifyTrack(spotifyTrack);
    console.log(youtubeId);
    // return `https://www.youtube.com/watch?v=${youtubeId}`;
    return youtubeId;
  }

  async getYoutubeIdFromSpotifyTrack(
    spotifyTrack: SpotifyApi.SingleTrackResponse,
  ) {
    const youtubeUrl: string | undefined = await this.spotifyToYoutubeMusic(
      spotifyTrack.id,
    );
    if (youtubeUrl) {
      const youtubeId = parseUrl(youtubeUrl).query.v;
      const durationISO = await this.youtubeApiService.getDurationInISO8601(
        youtubeId,
      );
      const duration = toSeconds(parse(durationISO));
      if (Math.abs(spotifyTrack.duration_ms / 1000 - duration) <= 1)
        return youtubeId;
    }

    const searchResults: YoutubeVideo[] = await this.searchMusics(
      spotifyTrack.name,
    );
    if (searchResults.length == 0) throw new NotFoundException();
    let filterResult = this.filterResults(
      searchResults.map((e) => {
        return {
          ...e,
          artists: e.artists
            .map((e) => {
              return e.name;
            })
            .toString(),
        };
      }),
      'title',
      spotifyTrack.name,
      0.5,
    );

    console.log(filterResult);

    filterResult = filterResult.filter(
      (e) =>
        Math.abs(e.duration.totalSeconds - spotifyTrack.duration_ms / 1000) <=
        1,
    );

    const resultYoutubeId = filterResult.length
      ? filterResult[0].youtubeId
      : searchResults[0].youtubeId;

    return resultYoutubeId;
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
