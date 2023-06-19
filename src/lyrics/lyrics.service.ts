import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrackLyrics } from './schemas/lyric.schema';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';

@Injectable()
export class LyricsService {
  constructor(
    @InjectModel(TrackLyrics.name)
    private trackLyricsModel: Model<TrackLyrics>,
    private spotifyApi: SpotifyApiService,
  ) {}

  async findOne(id: string) {
    const trackLyrics = await this.trackLyricsModel.findOne({ trackId: id });
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
      if (lyrics) {
        return lyrics;
      } else {
        throw new NotFoundException();
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
