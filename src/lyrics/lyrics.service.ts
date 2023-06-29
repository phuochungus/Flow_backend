import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrackLyrics } from './schemas/lyric.schema';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class LyricsService {
  constructor(
    @InjectModel(TrackLyrics.name)
    private trackLyricsModel: Model<TrackLyrics>,
    private spotifyApi: SpotifyApiService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findOne(id: string) {
    const cacheResult = await this.cacheManager.get(`lyrics_${id}`);
    if (cacheResult) {
      if (cacheResult != 'null') return cacheResult;
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
      const lyrics = await this.spotifyApi.getLyric(id);
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
}
