import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrackLyrics } from './schemas/lyric.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { Lyrics } from '../tracks/entities/lyrics.entity';
import { LyricsRepository } from '../abstract/abstract';

@Injectable()
export class MusixmatchLyricsRepository implements LyricsRepository {
  constructor(
    @InjectModel(TrackLyrics.name)
    private trackLyricsModel: Model<TrackLyrics>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  async findOne(id: string): Promise<Lyrics[]> {
    const cacheResult = await this.cacheManager.get(`lyrics_${id}`);
    if (cacheResult) {
      if (cacheResult != 'null') return cacheResult as Lyrics[];
      else throw new NotFoundException();
    }

    const trackLyrics = await this.trackLyricsModel
      .findOne({ trackId: id }, { _id: false })
      .lean();
    if (trackLyrics) {
      if (trackLyrics.lyrics) return trackLyrics.lyrics;
      throw new NotFoundException();
    }

    try {
      const lyrics = await this.getLyric(id);
      const createdDocument = new this.trackLyricsModel({
        trackId: id,
        lyrics,
      });

      createdDocument.save();
      if (lyrics) this.cacheManager.set(`lyrics_${id}`, lyrics);
      else this.cacheManager.set(`lyrics_${id}`, 'null');
      if (lyrics) {
        return lyrics;
      } else {
        throw new NotFoundException();
      }
    } catch (error) {
      if (!(error instanceof HttpException)) console.error(error);
      throw error;
    }
  }

  async getLyric(spotifyId: string): Promise<Lyrics[] | null> {
    try {
      const res = await this.httpService.axiosRef.get(
        'https://spotify-lyric-api.herokuapp.com/?trackid=' + spotifyId,
      );
      const lyrics = res.data.lines.map(
        (e: { startTimeMs: string; words: string }) => {
          return { startTimeMs: parseInt(e.startTimeMs), words: e.words };
        },
      );

      return lyrics;
    } catch (error) {
      if (error.response.status == 404) {
        return null;
      }
      console.error(error);
      throw error;
    }
  }
}
