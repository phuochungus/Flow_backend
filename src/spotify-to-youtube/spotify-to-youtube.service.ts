import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import Fuse from 'fuse.js';
import parseUrl from 'parse-url';
import SpotifyToYoutubeMusic from 'spotify-to-ytmusic';
import { YoutubeApiService } from '../youtube-api/youtube-api.service';
import { toSeconds, parse } from 'iso8601-duration';
import { InjectModel } from '@nestjs/mongoose';
import { SpotifyToYoutube } from './schemas/spotify-to-youtube.schema';
import { Model } from 'mongoose';
import {
  ISearchMusic,
  ISearchMusicToken,
  YoutubeMusicService,
} from '../youtube-music/youtube-music.service';

export type YoutubeVideo = {
  youtubeId: string;
  title: string;
  artists: { name: string }[];
  album: string;
  duration: { totalSeconds: number };
};

@Injectable()
export class SpotifyToYoutubeService implements OnModuleInit {
  constructor(
    @InjectModel(SpotifyToYoutube.name)
    private readonly spotifyToYoutubeModel: Model<SpotifyToYoutube>,
    private readonly youtubeApiService: YoutubeApiService,
    @Inject(ISearchMusicToken)
    private readonly youtubeMusicService: ISearchMusic,
  ) {}
  private spotifyToYoutubeMusic;

  async onModuleInit() {
    this.spotifyToYoutubeMusic = await SpotifyToYoutubeMusic({
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });
  }

  async getYoutubeIdFromSpotify(
    spotifyTrack: SpotifyApi.SingleTrackResponse,
  ): Promise<string> {
    const youtubeId = await this.getYoutubeIdFromSpotifyTrack(spotifyTrack);
    // console.log(youtubeId);
    return youtubeId;
  }

  private async storeDb(spotifyId: string, youtubeId: string) {
    const createdDoc = new this.spotifyToYoutubeModel({
      spotifyId: spotifyId,
      youtubeId: youtubeId,
    });
    await createdDoc.save();
  }

  async getYoutubeIdFromSpotifyTrack(
    spotifyTrack: SpotifyApi.SingleTrackResponse,
  ): Promise<string> {
    const doc = await this.spotifyToYoutubeModel.findOne({
      spotifyId: spotifyTrack.id,
    });

    if (doc) return doc.youtubeId;

    const youtubeURL: string | undefined = await this.spotifyToYoutubeMusic(
      spotifyTrack.id,
    );
    if (youtubeURL) {
      const youtubeId = parseUrl(youtubeURL).query.v;
      const durationISO = await this.youtubeApiService.getDurationInISO8601(
        youtubeId,
      );
      const duration = toSeconds(parse(durationISO));
      if (Math.abs(spotifyTrack.duration_ms / 1000 - duration) <= 1) {
        this.storeDb(spotifyTrack.id, youtubeId);
        return youtubeId;
      }
    }

    const searchResults: YoutubeVideo[] =
      await this.youtubeMusicService.searchMusics(
        spotifyTrack.name + spotifyTrack.artists.map((e) => e.name),
      );

    if (searchResults.length == 0) throw new NotFoundException();
    let filterResultByTitle = this.filterResults(
      searchResults.map((e) => {
        return {
          ...e,
          artists: e.artists.map((e) => e.name).toString(),
        };
      }),
      'title',
      spotifyTrack.name,
      0.5,
    );

    filterResultByTitle = filterResultByTitle.filter(
      (e) =>
        Math.abs(e.duration.totalSeconds - spotifyTrack.duration_ms / 1000) <=
        1,
    );

    const resultYoutubeId = filterResultByTitle.length
      ? filterResultByTitle[0].youtubeId
      : searchResults[0].youtubeId;
    this.storeDb(spotifyTrack.id, resultYoutubeId);
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
