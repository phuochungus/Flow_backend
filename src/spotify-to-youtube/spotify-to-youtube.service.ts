import {
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
import { SearchMusicService } from '../youtube-music/youtube-music.service';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';

export type YoutubeVideo = {
  youtubeId: string;
  title: string;
  artists: { name: string }[];
  album: string;
  duration: { totalSeconds: number };
};

export abstract class SpotifyToYoutubeSearcherService {
  abstract convertSpotifyIdToYoutubeId(id: string): Promise<string>;
  abstract converSpotifyContentToYoutubeId(
    content: SpotifyApi.SingleTrackResponse,
  ): Promise<string>;
}

@Injectable()
export class SpotifyToYoutubeService
  implements OnModuleInit, SpotifyToYoutubeSearcherService
{
  constructor(
    @InjectModel(SpotifyToYoutube.name)
    private readonly spotifyToYoutubeModel: Model<SpotifyToYoutube>,
    private readonly youtubeApiService: YoutubeApiService,
    private readonly youtubeMusicService: SearchMusicService,
    private readonly spotifyApiService: SpotifyApiService,
  ) {}
  private spotifyToYoutubeMusic;

  async onModuleInit() {
    this.spotifyToYoutubeMusic = await SpotifyToYoutubeMusic({
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });
  }

  async convertSpotifyIdToYoutubeId(id: string): Promise<string> {
    const spotifyContent = (
      await this.spotifyApiService.spotifyWebApi.getTrack(id)
    ).body;
    return await this.converSpotifyContentToYoutubeId(spotifyContent);
  }

  async converSpotifyContentToYoutubeId(
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
      await this.youtubeMusicService.searchMusicContent(
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

  private async storeDb(spotifyId: string, youtubeId: string) {
    const createdDoc = new this.spotifyToYoutubeModel({
      spotifyId: spotifyId,
      youtubeId: youtubeId,
    });
    await createdDoc.save();
  }
}
